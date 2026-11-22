#include <arpa/inet.h>
#include <errno.h>
#include <inttypes.h>
#include <pthread.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

#include <modbus.h>

enum {
    EPOCH = 0,
    VERSION = 1,
    POSITION_HIGH = 2,
    POSITION_LOW = 3,
    WORD_COUNT = 4,
    REQUESTS = 16,
    READ_HOLDING_REGISTERS = 3
};

typedef struct {
    modbus_t *link;
    int listener;
    bool finished;
} Server;

static void prepare_publication(uint16_t *words, uint16_t epoch, uint16_t version, int32_t position)
{
    const uint32_t raw = (uint32_t)position;
    words[EPOCH] = epoch;
    words[VERSION] = version;
    words[POSITION_HIGH] = (uint16_t)(raw >> 16);
    words[POSITION_LOW] = (uint16_t)raw;
}

static void advance_after_reply(uint16_t *words, int replied)
{
    switch (replied) {
        case 1:
            prepare_publication(words, 7, 12, 131072);
            break;
        case 4:
            /* The next read catches a source update partway through. */
            words[VERSION] = 13;
            words[POSITION_HIGH] = UINT16_MAX;
            break;
        case 5:
            words[POSITION_LOW] = UINT16_MAX;
            words[VERSION] = 14;
            break;
        case 10:
            /* Simulate a declared source epoch change with the same version. */
            prepare_publication(words, 8, 14, 131073);
            break;
        default:
            break;
    }
}

static void *serve_exercise(void *arg)
{
    Server *server = arg;
    modbus_mapping_t *map = modbus_mapping_new(0, 0, WORD_COUNT, 0);
    if (!map) {
        fprintf(stderr, "Could not create the local register map\n");
        return NULL;
    }
    prepare_publication(map->tab_registers, 7, 10, 131071);
    if (modbus_tcp_accept(server->link, &server->listener) == -1) {
        fprintf(stderr, "Accept failed: %s\n", modbus_strerror(errno));
        modbus_mapping_free(map);
        return NULL;
    }
    const int header_length = modbus_get_header_length(server->link);
    for (int index = 1; index <= REQUESTS; index++) {
        uint8_t query[MODBUS_TCP_MAX_ADU_LENGTH];
        const int received = modbus_receive(server->link, query);
        if (received <= header_length || query[header_length] != READ_HOLDING_REGISTERS
            || modbus_reply(server->link, query, received, map) < 0) {
            fprintf(stderr, "Unexpected request or reply failure at number %d\n", index);
            break;
        }
        advance_after_reply(map->tab_registers, index);
        server->finished = index == REQUESTS;
    }
    modbus_close(server->link);
    modbus_mapping_free(map);
    return NULL;
}

static int32_t position_from_words(const uint16_t words[2])
{
    const uint32_t raw = ((uint32_t)words[0] << 16) | words[1];
    const int64_t signed_value = raw >= UINT32_C(2147483648) ?
        (int64_t)raw - INT64_C(4294967296) : (int64_t)raw;
    return (int32_t)signed_value;
}

static bool read_words(modbus_t *client, int address, int count, uint16_t *words)
{
    if (modbus_read_registers(client, address, count, words) == count) {
        return true;
    }
    fprintf(stderr, "Read at zero-based offset %d failed: %s\n", address, modbus_strerror(errno));
    return false;
}

static bool check_guarded_read(modbus_t *client, const char *name,
                               int32_t expected_position, const char *expected_decision)
{
    uint16_t start[2], position[2], end[2];
    if (!read_words(client, EPOCH, 2, start) || !read_words(client, POSITION_HIGH, 2, position)
        || !read_words(client, EPOCH, 2, end)) {
        return false;
    }
    /* This exercise's commissioning record authorizes only source epoch 7. */
    const char *decision = "accept";
    if (start[EPOCH] != end[EPOCH] || start[VERSION] != end[VERSION] || (start[VERSION] & 1)) {
        decision = "retry_inconsistent";
    } else if (start[EPOCH] != 7) {
        decision = "hold_unknown_epoch";
    }
    const int32_t value = position_from_words(position);
    printf("%s,%s,%u,%u,%u,%u,%04X,%04X,%" PRId32 "\n",
           name, decision, (unsigned)start[EPOCH], (unsigned)start[VERSION],
           (unsigned)end[EPOCH], (unsigned)end[VERSION],
           (unsigned)position[0], (unsigned)position[1], value);
    return value == expected_position && strcmp(decision, expected_decision) == 0;
}

static bool run_client(modbus_t *client)
{
    uint16_t position[2];
    puts("check,decision,before_epoch,before_version,after_epoch,after_version,high,low,position_um");
    if (!read_words(client, POSITION_HIGH, 1, position)
        || !read_words(client, POSITION_LOW, 1, position + 1)) {
        return false;
    }
    printf("split_reads,torn_position,,,,,%04X,%04X,%" PRId32 "\n",
           (unsigned)position[0], (unsigned)position[1], position_from_words(position));
    bool success = position_from_words(position) == 65536;

    if (!read_words(client, POSITION_HIGH, 2, position)) {
        return false;
    }
    printf("grouped_stable,correct_position,,,,,%04X,%04X,%" PRId32 "\n",
           (unsigned)position[0], (unsigned)position[1], position_from_words(position));
    success &= position_from_words(position) == 131072;
    success &= check_guarded_read(client, "grouped_during_update", -65536, "retry_inconsistent");
    success &= check_guarded_read(client, "grouped_after_update", -1, "accept");
    success &= check_guarded_read(client, "restart_between_reads", 131073, "retry_inconsistent");
    success &= check_guarded_read(client, "coherent_new_epoch", 131073, "hold_unknown_epoch");

    const bool unmapped = modbus_read_registers(client, WORD_COUNT + 4, 1, position) == -1
        && errno == EMBXILADD;
    puts(unmapped ? "unmapped,exception_02,,,,,,," : "unmapped,unexpected_reply,,,,,,,");
    return success && unmapped;
}

int main(void)
{
    Server server = {.link = modbus_new_tcp("127.0.0.1", 0), .listener = -1, .finished = false};
    modbus_t *client = NULL;
    bool connected = false;
    bool success = false;
    if (!server.link || modbus_set_indication_timeout(server.link, 2, 0) < 0) {
        goto done;
    }
    server.listener = modbus_tcp_listen(server.link, 1);
    if (server.listener < 0) {
        goto done;
    }
    struct sockaddr_in address = {0};
    socklen_t length = sizeof(address);
    if (getsockname(server.listener, (struct sockaddr *)&address, &length) < 0) {
        goto done;
    }
    client = modbus_new_tcp("127.0.0.1", ntohs(address.sin_port));
    if (!client || modbus_set_response_timeout(client, 2, 0) < 0 || modbus_connect(client) < 0) {
        goto done;
    }
    connected = true;
    pthread_t thread;
    if (pthread_create(&thread, NULL, serve_exercise, &server) != 0) {
        fputs("Could not launch the local server thread\n", stderr);
        goto done;
    }
    success = run_client(client);
    modbus_close(client);
    connected = false;
    pthread_join(thread, NULL);
    success &= server.finished;

done:
    if (!success) fputs("Loopback exercise failed one or more checks\n", stderr);
    if (connected) modbus_close(client);
    if (client) modbus_free(client);
    if (server.listener >= 0) close(server.listener);
    if (server.link) modbus_free(server.link);
    return success ? 0 : 1;
}
