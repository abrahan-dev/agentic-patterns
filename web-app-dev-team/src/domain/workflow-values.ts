export enum TurnDecision {
  Handoff = "handoff",
  Complete = "complete",
}

export enum RunStatus {
  Running = "running",
  Completed = "completed",
  Failed = "failed",
}

export enum SpecificationReviewDecision {
  Approved = "approved",
  ChangesRequested = "changes_requested",
}

export enum RestitutionStatus {
  Running = RunStatus.Running,
  Interrupted = "interrupted",
  Completed = RunStatus.Completed,
}
