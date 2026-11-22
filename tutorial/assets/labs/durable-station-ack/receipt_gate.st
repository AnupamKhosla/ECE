FUNCTION_BLOCK RECEIPTGATE
VAR_INPUT
  ClockMs : UDINT;
  LinkHealthy : BOOL;
  Review : BOOL;
  CandidatePresent : BOOL;
  CandidateSession : UDINT;
  CandidateJob : UDINT;
  CandidatePart : UDINT;
  CandidateGeneration : UDINT;
  ReceiptValid : BOOL;
  ReceiptSession : UDINT;
  ReceiptJob : UDINT;
  ReceiptPart : UDINT;
  ReceiptGeneration : UDINT;
END_VAR
VAR_OUTPUT
  Phase : USINT := 0;
  StoreRequest : BOOL;
  Consumed : BOOL;
  ActiveSession : UDINT;
  ActiveJob : UDINT;
  ActivePart : UDINT;
  ActiveGeneration : UDINT;
END_VAR
VAR
  PreviousReview : BOOL := TRUE;
  FreshReview : BOOL;
  SameCandidate : BOOL;
  MatchingReceipt : BOOL;
  StartedAt : UDINT;
  Elapsed : UDINT;
END_VAR

FreshReview := Review AND NOT PreviousReview;
PreviousReview := Review;
StoreRequest := FALSE;
Consumed := FALSE;

SameCandidate := CandidatePresent
  AND (CandidateSession = ActiveSession) AND (CandidateJob = ActiveJob)
  AND (CandidatePart = ActivePart) AND (CandidateGeneration = ActiveGeneration);
MatchingReceipt := ReceiptValid
  AND (ReceiptSession = ActiveSession) AND (ReceiptJob = ActiveJob)
  AND (ReceiptPart = ActivePart) AND (ReceiptGeneration = ActiveGeneration);

IF NOT LinkHealthy THEN
  Phase := 0;
ELSE
  CASE Phase OF
    0: (* Hold for a fresh review of the physical candidate. *)
      IF FreshReview AND CandidatePresent AND (CandidateSession > 0)
        AND (CandidateJob > 0) AND (CandidatePart > 0) AND (CandidateGeneration > 0) THEN
        ActiveSession := CandidateSession;
        ActiveJob := CandidateJob;
        ActivePart := CandidatePart;
        ActiveGeneration := CandidateGeneration;
        StartedAt := ClockMs;
        Phase := 1;
        StoreRequest := TRUE;
      END_IF;
    1: (* Await a receipt for the same candidate. *)
      IF ClockMs >= StartedAt THEN
        Elapsed := ClockMs - StartedAt;
      ELSE
        Elapsed := (UDINT#4294967295 - StartedAt) + ClockMs + UDINT#1;
      END_IF;
      IF NOT SameCandidate THEN
        Phase := 0;
      ELSIF MatchingReceipt AND (Elapsed <= UDINT#200) THEN
        Phase := 2;
        Consumed := TRUE;
      ELSIF Elapsed >= UDINT#200 THEN
        Phase := 0;
      ELSE
        StoreRequest := TRUE;
      END_IF;
    2: (* The same result may observe the acknowledgment again. *)
      IF SameCandidate THEN
        Consumed := TRUE;
      ELSE
        Phase := 0;
      END_IF;
    ELSE
      Phase := 0;
  END_CASE;
END_IF;
END_FUNCTION_BLOCK
