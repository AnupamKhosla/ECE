#include <inttypes.h>
#include <stdio.h>
#include <string.h>

#include "FreeRTOS.h"
#include "semphr.h"
#include "task.h"

enum {
    LOGGER_PRIORITY = 1,
    ANALYSIS_PRIORITY = 2,
    CONTROL_PRIORITY = 3,
    SUPERVISOR_PRIORITY = 4,
    LOGGER_DONE = 1,
    ANALYSIS_DONE = 2,
    CONTROL_DONE = 4,
    ALL_DONE = LOGGER_DONE | ANALYSIS_DONE | CONTROL_DONE,
    TASK_STACK_WORDS = 2048,
    LOGGER_WORK_TICKS = 8,
    ANALYSIS_WORK_TICKS = 80
};

typedef enum {
    LOGGER_TAKES,
    CONTROL_WAITS,
    ANALYSIS_STARTS,
    ANALYSIS_FINISHES,
    LOGGER_RESUMES,
    LOGGER_GIVES,
    CONTROL_TAKES,
    EVENT_COUNT
} Event;

static const char *const event_names[EVENT_COUNT] = {
    [LOGGER_TAKES] = "logger_takes",
    [CONTROL_WAITS] = "control_waits",
    [ANALYSIS_STARTS] = "analysis_starts",
    [ANALYSIS_FINISHES] = "analysis_finishes",
    [LOGGER_RESUMES] = "logger_resumes",
    [LOGGER_GIVES] = "logger_gives",
    [CONTROL_TAKES] = "control_takes"
};

typedef struct {
    Event event;
    TickType_t tick;
    UBaseType_t priority;
} TraceEntry;

static TraceEntry trace[EVENT_COUNT];
static size_t trace_length;
static SemaphoreHandle_t resource;
static TaskHandle_t control_task;
static TaskHandle_t analysis_task;
static TaskHandle_t supervisor_task;

static void record_event(Event event)
{
    taskENTER_CRITICAL();
    configASSERT(trace_length < EVENT_COUNT);
    trace[trace_length++] = (TraceEntry) {
        .event = event,
        .tick = xTaskGetTickCount(),
        .priority = uxTaskPriorityGet(NULL),
    };
    taskEXIT_CRITICAL();
}

static void synthetic_cpu_work(TickType_t ticks)
{
    const TickType_t start = xTaskGetTickCount();
    while ((TickType_t)(xTaskGetTickCount() - start) < ticks) {
        /* This task stays ready. Sleeping here would change the experiment. */
    }
}

static void finish(uint32_t flag)
{
    xTaskNotify(supervisor_task, flag, eSetBits);
    vTaskDelete(NULL);
}

static void logger(void *unused)
{
    (void)unused;
    configASSERT(xSemaphoreTake(resource, portMAX_DELAY) == pdTRUE);
    record_event(LOGGER_TAKES);
    xTaskNotifyGive(control_task);
    record_event(LOGGER_RESUMES);
    synthetic_cpu_work(LOGGER_WORK_TICKS);
    record_event(LOGGER_GIVES);
    configASSERT(xSemaphoreGive(resource) == pdTRUE);
    finish(LOGGER_DONE);
}

static void control(void *unused)
{
    (void)unused;
    ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
    record_event(CONTROL_WAITS);
    xTaskNotifyGive(analysis_task);
    configASSERT(xSemaphoreTake(resource, portMAX_DELAY) == pdTRUE);
    record_event(CONTROL_TAKES);
    configASSERT(xSemaphoreGive(resource) == pdTRUE);
    finish(CONTROL_DONE);
}

static void analysis(void *unused)
{
    (void)unused;
    ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
    record_event(ANALYSIS_STARTS);
    synthetic_cpu_work(ANALYSIS_WORK_TICKS);
    record_event(ANALYSIS_FINISHES);
    finish(ANALYSIS_DONE);
}

static void supervise(void *unused)
{
    (void)unused;
    uint32_t completed = 0;
    while (completed != ALL_DONE) {
        uint32_t reported = 0;
        configASSERT(xTaskNotifyWait(0, UINT32_MAX, &reported, portMAX_DELAY) == pdTRUE);
        completed |= reported;
    }
    vTaskEndScheduler();
}

static void start_task(TaskFunction_t entry, const char *name, UBaseType_t priority,
                       TaskHandle_t *handle)
{
    configASSERT(xTaskCreate(entry, name, TASK_STACK_WORDS, NULL, priority, handle) == pdPASS);
}

static void report_trace(const char *mode, BaseType_t use_mutex)
{
    const Event binary_order[] = {
        LOGGER_TAKES, CONTROL_WAITS, ANALYSIS_STARTS, ANALYSIS_FINISHES,
        LOGGER_RESUMES, LOGGER_GIVES, CONTROL_TAKES
    };
    const Event mutex_order[] = {
        LOGGER_TAKES, CONTROL_WAITS, LOGGER_RESUMES, LOGGER_GIVES,
        CONTROL_TAKES, ANALYSIS_STARTS, ANALYSIS_FINISHES
    };
    const Event *expected = use_mutex ? mutex_order : binary_order;
    const UBaseType_t logger_resumed_at = use_mutex ? CONTROL_PRIORITY : LOGGER_PRIORITY;
    TickType_t control_wait = 0;
    TickType_t control_take = 0;

    configASSERT(trace_length == EVENT_COUNT);
    puts("mode,sequence,tick_from_start,event,effective_priority");
    for (size_t i = 0; i < trace_length; i++) {
        const TraceEntry entry = trace[i];
        configASSERT(entry.event == expected[i]);
        if (entry.event == LOGGER_RESUMES) {
            configASSERT(entry.priority == logger_resumed_at);
        }
        if (entry.event == CONTROL_WAITS) {
            control_wait = entry.tick;
        }
        if (entry.event == CONTROL_TAKES) {
            control_take = entry.tick;
        }
        printf("%s,%zu,%" PRIu32 ",%s,%lu\n", mode, i + 1,
               (uint32_t)(entry.tick - trace[0].tick), event_names[entry.event],
               (unsigned long)entry.priority);
    }
    fprintf(stderr, "%s control wait: %" PRIu32 " ticks\n", mode,
            (uint32_t)(control_take - control_wait));
}

int main(int argc, char **argv)
{
    if (argc != 2 || (strcmp(argv[1], "mutex") != 0 && strcmp(argv[1], "binary") != 0)) {
        fprintf(stderr, "Usage: %s binary|mutex\n", argv[0]);
        return 2;
    }
    const BaseType_t use_mutex = strcmp(argv[1], "mutex") == 0;
    resource = use_mutex ? xSemaphoreCreateMutex() : xSemaphoreCreateBinary();
    configASSERT(resource != NULL);
    if (!use_mutex) {
        configASSERT(xSemaphoreGive(resource) == pdTRUE);
    }

    start_task(supervise, "supervisor", SUPERVISOR_PRIORITY, &supervisor_task);
    start_task(control, "control", CONTROL_PRIORITY, &control_task);
    start_task(analysis, "analysis", ANALYSIS_PRIORITY, &analysis_task);
    start_task(logger, "logger", LOGGER_PRIORITY, NULL);
    vTaskStartScheduler();
    report_trace(argv[1], use_mutex);
    return 0;
}
