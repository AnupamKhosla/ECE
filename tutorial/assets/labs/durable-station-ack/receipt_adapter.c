#include <stdint.h>
#include <string.h>

#include "iec_std_lib.h"
#include "accessor.h"
#include "POUS.h"

TIME __CURRENT_TIME;
#include "POUS.c"

static RECEIPTGATE_data__ gate;

void reset_gate(void)
{
    memset(&gate, 0, sizeof(gate));
    RECEIPTGATE_init__(&gate, 0);
}

uint32_t scan_gate(uint32_t time_ms, uint32_t link, uint32_t review,
                   uint32_t candidate_present, const uint32_t candidate[4],
                   uint32_t receipt_valid, const uint32_t receipt[4])
{
    gate.CLOCKMS.value = time_ms;
    gate.LINKHEALTHY.value = link != 0;
    gate.REVIEW.value = review != 0;
    gate.CANDIDATEPRESENT.value = candidate_present != 0;
    gate.CANDIDATESESSION.value = candidate[0];
    gate.CANDIDATEJOB.value = candidate[1];
    gate.CANDIDATEPART.value = candidate[2];
    gate.CANDIDATEGENERATION.value = candidate[3];
    gate.RECEIPTVALID.value = receipt_valid != 0;
    gate.RECEIPTSESSION.value = receipt[0];
    gate.RECEIPTJOB.value = receipt[1];
    gate.RECEIPTPART.value = receipt[2];
    gate.RECEIPTGENERATION.value = receipt[3];

    RECEIPTGATE_body__(&gate);
    return (uint32_t)gate.PHASE.value * 4U + (uint32_t)gate.CONSUMED.value * 2U
        + (uint32_t)gate.STOREREQUEST.value;
}
