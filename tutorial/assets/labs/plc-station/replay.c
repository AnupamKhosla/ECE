#include <inttypes.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "iec_std_lib.h"
#include "accessor.h"
#include "POUS.h"

TIME __CURRENT_TIME;

/* The pinned MatIEC emitter places the scan code in static C functions. */
#include "POUS.c"

typedef STATIONCYCLE_data__ STATIONCYCLE;

static void require(bool condition, const char *message)
{
    if (condition) return;
    fprintf(stderr, "Replay assertion failed: %s\n", message);
    exit(EXIT_FAILURE);
}

static void scan(STATIONCYCLE *station, const char *test, uint32_t time, const char *event)
{
    static const char *const phases[] = {
        "ReviewRequired", "ReadyForJob", "WaitForAck", "WaitForResult", "WaitForClear"
    };
    static const char *const faults[] = {
        "NoFault", "LinkLost", "AckDeadline", "ResultDeadline", "RobotRejected", "InvalidState"
    };
    station->CLOCKMS.value = time;
    STATIONCYCLE_body__(station);
    printf("%s,%" PRIu32 ",%s,%s,%u,%u,%" PRIu32 ",%" PRIu32 ",%" PRIu32 ",%" PRIu32 ",%s\n",
           test, time, event, phases[station->PHASE.value],
           (unsigned)station->REQUESTVALID.value, (unsigned)station->CONSUMEDVALID.value,
           station->INTERFACEJOBID.value, station->LASTISSUEDID.value,
           station->LASTCOMMITTEDID.value, station->GOODPARTS.value, faults[station->FIRSTFAULT.value]);
}

static STATIONCYCLE ready(const char *test, uint32_t time)
{
    STATIONCYCLE station = {0};
    STATIONCYCLE_init__(&station, 0);
    station.LINKHEALTHY.value = true;
    station.ROBOTIDLE.value = true;
    station.FIXTURECLEAR.value = true;
    scan(&station, test, time, "Boot");
    require(station.PHASE.value == CELLPHASE__REVIEWREQUIRED, "boot requires review");
    station.REVIEWREQUEST.value = true;
    scan(&station, test, time + 10, "Reviewed idle robot and clear station");
    require(station.PHASE.value == CELLPHASE__READYFORJOB, "review releases empty station");
    station.REVIEWREQUEST.value = false;
    return station;
}

static void start_job(STATIONCYCLE *station, const char *test, uint32_t time)
{
    station->STARTREQUEST.value = true;
    station->NEWJOBID.value = 42;
    scan(station, test, time, "Start job 42");
    require(station->REQUESTVALID.value && station->INTERFACEJOBID.value == 42, "issue job 42");
}

static void set_ack(STATIONCYCLE *station, uint32_t id)
{
    station->ACKVALID.value = true;
    station->ACKJOBID.value = id;
}

static void set_result(STATIONCYCLE *station, uint32_t id, bool good)
{
    station->RESULTVALID.value = true;
    station->RESULTJOBID.value = id;
    station->RESULTGOOD.value = good;
}

static void clear_station(STATIONCYCLE *station)
{
    station->RESULTVALID.value = false;
    station->PLACEMENTVALID.value = false;
    station->FIXTURECLEAR.value = true;
    station->ROBOTIDLE.value = true;
}

static void normal_completion(void)
{
    const char *test = "complete";
    STATIONCYCLE station = ready(test, 0);
    start_job(&station, test, 20);
    set_ack(&station, 41);
    scan(&station, test, 260, "Old acknowledgment while start is held");
    require(station.REQUESTVALID.value, "stale acknowledgment leaves current request active");
    set_ack(&station, 42);
    station.ROBOTIDLE.value = false;
    scan(&station, test, 270, "Matching acknowledgment on deadline");
    require(station.PHASE.value == CELLPHASE__WAITFORRESULT, "inclusive acknowledgment deadline");

    set_result(&station, 41, true);
    scan(&station, test, 500, "Old result for job 41");
    require(station.GOODPARTS.value == 0, "old result never counts");
    set_result(&station, 42, true);
    scan(&station, test, 510, "Current result without placement proof");
    require(station.GOODPARTS.value == 0, "wait for proof despite a good result");
    station.PLACEMENTVALID.value = true;
    station.PLACEMENTJOBID.value = 42;
    station.FIXTURECLEAR.value = false;
    scan(&station, test, 540, "New matching placement proof");
    require(station.CONSUMEDVALID.value && station.GOODPARTS.value == 1, "commit one proved part");

    scan(&station, test, 550, "Held result and start");
    require(station.CONSUMEDVALID.value && station.GOODPARTS.value == 1, "held result remains idempotent");
    station.LINKHEALTHY.value = false;
    scan(&station, test, 560, "Link drops after commit");
    require(!station.CONSUMEDVALID.value && station.GOODPARTS.value == 1, "preserve committed count through link loss");
    station.LINKHEALTHY.value = true;
    scan(&station, test, 570, "Link returns with the same committed result");
    require(station.CONSUMEDVALID.value && station.GOODPARTS.value == 1, "acceptance acknowledgment can be repeated");

    clear_station(&station);
    station.REVIEWREQUEST.value = true;
    scan(&station, test, 600, "Review record and clear fixture");
    scan(&station, test, 610, "Start still held after review");
    require(!station.REQUESTVALID.value, "held start must be released after review");
    station.STARTREQUEST.value = false;
    scan(&station, test, 620, "Start released");
    station.STARTREQUEST.value = true;
    scan(&station, test, 630, "Repeated request for previously issued job 42");
    require(!station.REQUESTVALID.value && station.GOODPARTS.value == 1, "never issue reused job ID");
}

static void late_acknowledgment(void)
{
    const char *test = "late_ack";
    STATIONCYCLE station = ready(test, 0);
    start_job(&station, test, 20);
    scan(&station, test, 270, "No acknowledgment at deadline");
    require(station.FIRSTFAULT.value == CELLFAULT__ACKDEADLINE && !station.REQUESTVALID.value,
            "acknowledgment timeout removes request");
    set_ack(&station, 42);
    scan(&station, test, 280, "Matching acknowledgment arrives after deadline");
    require(station.PHASE.value == CELLPHASE__REVIEWREQUIRED && station.GOODPARTS.value == 0,
            "late acknowledgment leaves hold in force");
}

static void result_timeout(void)
{
    const char *test = "missing_proof";
    STATIONCYCLE station = ready(test, 0);
    start_job(&station, test, 20);
    set_ack(&station, 42);
    scan(&station, test, 50, "Robot accepted job");
    set_result(&station, 42, true);
    station.PLACEMENTVALID.value = true;
    station.PLACEMENTJOBID.value = 41;
    scan(&station, test, 800, "Matching result but proof belongs to job 41");
    scan(&station, test, 1550, "Result deadline with wrong placement ID");
    require(station.FIRSTFAULT.value == CELLFAULT__RESULTDEADLINE && station.GOODPARTS.value == 0,
            "mismatched proof cannot commit a part");
}

static void rollover_and_link_loss(void)
{
    const char *test = "wrap_and_loss";
    const uint32_t issue_time = UINT32_MAX - 40;
    STATIONCYCLE station = ready(test, issue_time - 20);
    start_job(&station, test, issue_time);
    set_ack(&station, 42);
    scan(&station, test, issue_time + UINT32_C(250), "Matching acknowledgment crosses clock wrap");
    require(station.PHASE.value == CELLPHASE__WAITFORRESULT, "elapsed time survives unsigned wrap");
    set_result(&station, 42, true);
    station.PLACEMENTVALID.value = true;
    station.PLACEMENTJOBID.value = 42;
    station.FIXTURECLEAR.value = false;
    station.LINKHEALTHY.value = false;
    scan(&station, test, 219, "Result and proof coincide with lost link");
    require(station.FIRSTFAULT.value == CELLFAULT__LINKLOST && station.GOODPARTS.value == 0,
            "link interruption takes priority over uncommitted result");
}

static void rearm_after_boot(void)
{
    const char *test = "boot_and_rearm";
    STATIONCYCLE station = {0};
    STATIONCYCLE_init__(&station, 0);
    station.LINKHEALTHY.value = true;
    station.ROBOTIDLE.value = true;
    station.FIXTURECLEAR.value = true;
    station.REVIEWREQUEST.value = true;
    station.STARTREQUEST.value = true;
    station.NEWJOBID.value = 42;
    scan(&station, test, 0, "Both buttons held at boot");
    require(station.PHASE.value == CELLPHASE__REVIEWREQUIRED, "held review at boot grants no permission");

    station.REVIEWREQUEST.value = false;
    scan(&station, test, 10, "Review released");
    station.REVIEWREQUEST.value = true;
    scan(&station, test, 20, "Fresh review edge");
    scan(&station, test, 30, "Start still held");
    require(station.PHASE.value == CELLPHASE__READYFORJOB && !station.REQUESTVALID.value,
            "held start cannot become a new edge during review");

    station.STARTREQUEST.value = false;
    station.PLACEMENTVALID.value = true;
    station.PLACEMENTJOBID.value = 41;
    scan(&station, test, 40, "Start released and prior placement remains active");
    station.STARTREQUEST.value = true;
    scan(&station, test, 50, "Fresh start blocked by prior placement");
    require(!station.REQUESTVALID.value, "stale placement blocks new job");
    station.PLACEMENTVALID.value = false;
    scan(&station, test, 60, "Placement clears while start is held");
    require(!station.REQUESTVALID.value, "clearing a condition does not turn a held start into an edge");
    station.STARTREQUEST.value = false;
    scan(&station, test, 70, "Start released with station clear");
    start_job(&station, test, 80);
}

int main(void)
{
    puts("case,clock_ms,event,phase,request_valid,consumed_valid,interface_job_id,last_issued_id,last_committed_id,good_parts,first_fault");
    normal_completion();
    late_acknowledgment();
    result_timeout();
    rollover_and_link_loss();
    rearm_after_boot();
    fprintf(stderr, "All station replay assertions passed.\n");
    return EXIT_SUCCESS;
}
