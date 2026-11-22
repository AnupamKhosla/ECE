(* Software-only robot station. No axes, field outputs or safety functions. *)
TYPE
  CellPhase : (ReviewRequired, ReadyForJob, WaitForAck, WaitForResult, WaitForClear);
  CellFault : (NoFault, LinkLost, AckDeadline, ResultDeadline, RobotRejected, InvalidState);
END_TYPE

FUNCTION ElapsedMilliseconds : UDINT
VAR_INPUT
  ClockNow : UDINT;
  StartedAt : UDINT;
END_VAR
IF ClockNow >= StartedAt THEN
  ElapsedMilliseconds := ClockNow - StartedAt;
ELSE
  ElapsedMilliseconds := (UDINT#4294967295 - StartedAt) + ClockNow + UDINT#1;
END_IF;
END_FUNCTION

FUNCTION_BLOCK StationCycle
VAR_INPUT
  ClockMs : UDINT;
  ReviewRequest : BOOL;
  StartRequest : BOOL;
  NewJobId : UDINT;
  LinkHealthy : BOOL;
  RobotIdle : BOOL;
  FixtureClear : BOOL;
  AckValid : BOOL;
  AckJobId : UDINT;
  ResultValid : BOOL;
  ResultGood : BOOL;
  ResultJobId : UDINT;
  PlacementValid : BOOL;
  PlacementJobId : UDINT;
END_VAR
VAR_OUTPUT
  Phase : CellPhase := ReviewRequired;
  FirstFault : CellFault := NoFault;
  RequestValid : BOOL;
  ConsumedValid : BOOL;
  InterfaceJobId : UDINT;
  LastIssuedId : UDINT;
  LastCommittedId : UDINT;
  GoodParts : UDINT;
END_VAR
VAR
  StartWasOn : BOOL := TRUE;
  ReviewWasOn : BOOL := TRUE;
  StartEdge : BOOL;
  ReviewEdge : BOOL;
  ActiveJobId : UDINT;
  PhaseStarted : UDINT;
  Elapsed : UDINT;
END_VAR

StartEdge := StartRequest AND NOT StartWasOn;
ReviewEdge := ReviewRequest AND NOT ReviewWasOn;
StartWasOn := StartRequest;
ReviewWasOn := ReviewRequest;
Elapsed := ElapsedMilliseconds(ClockMs, PhaseStarted);

IF Phase <> ReviewRequired AND NOT LinkHealthy THEN
  FirstFault := LinkLost;
  Phase := ReviewRequired;
ELSE
  CASE Phase OF
    ReviewRequired:
      IF ReviewEdge AND LinkHealthy AND RobotIdle AND FixtureClear AND NOT PlacementValid AND NOT ResultValid THEN
        ActiveJobId := UDINT#0;
        FirstFault := NoFault;
        Phase := ReadyForJob;
      END_IF;

    ReadyForJob:
      IF StartEdge AND RobotIdle AND FixtureClear AND NOT PlacementValid AND NOT ResultValid AND NewJobId > LastIssuedId THEN
        ActiveJobId := NewJobId;
        LastIssuedId := NewJobId;
        PhaseStarted := ClockMs;
        Phase := WaitForAck;
      END_IF;

    WaitForAck:
      IF Elapsed <= UDINT#250 AND AckValid AND AckJobId = ActiveJobId THEN
        PhaseStarted := ClockMs;
        Phase := WaitForResult;
      ELSIF Elapsed >= UDINT#250 THEN
        FirstFault := AckDeadline;
        Phase := ReviewRequired;
      END_IF;

    WaitForResult:
      IF Elapsed <= UDINT#1500 AND ResultValid AND ResultJobId = ActiveJobId THEN
        IF NOT ResultGood THEN
          FirstFault := RobotRejected;
          Phase := ReviewRequired;
        ELSIF PlacementValid AND PlacementJobId = ActiveJobId THEN
          LastCommittedId := ActiveJobId;
          GoodParts := GoodParts + UDINT#1;
          Phase := WaitForClear;
        END_IF;
      END_IF;

      IF Phase = WaitForResult AND Elapsed >= UDINT#1500 THEN
        FirstFault := ResultDeadline;
        Phase := ReviewRequired;
      END_IF;

    WaitForClear:
      IF NOT ResultValid AND FixtureClear AND NOT PlacementValid AND RobotIdle THEN
        ActiveJobId := UDINT#0;
        Phase := ReadyForJob;
      END_IF;

    ELSE
      FirstFault := InvalidState;
      Phase := ReviewRequired;
  END_CASE;
END_IF;

RequestValid := Phase = WaitForAck;
InterfaceJobId := ActiveJobId;
(* Resume a completion acknowledgment for the already committed job after link loss. *)
ConsumedValid := LinkHealthy AND ResultValid AND ResultGood AND ActiveJobId <> UDINT#0
                 AND ResultJobId = ActiveJobId AND LastCommittedId = ActiveJobId
                 AND (Phase = WaitForClear OR Phase = ReviewRequired);

END_FUNCTION_BLOCK
