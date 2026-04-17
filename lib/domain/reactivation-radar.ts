export type ReactivationOpportunityKind = "win_back" | "stalled_follow_up";

export type ReactivationReasonCode =
  | "inactive_after_paid_work"
  | "inactive_after_approved_quote"
  | "quote_stalled_without_progress"
  | "no_recent_activity_after_commercial_signal";

export type ReactivationRadarCandidate = {
  id: string;
  clientId: string;
  clientName: string;
  opportunityKind: ReactivationOpportunityKind;
  reasonCode: ReactivationReasonCode;
  reasonLabel: string;
  lastActivityAt: string;
  daysInactive: number;
  referenceQuoteId?: string;
  referenceChargeId?: string;
  referenceAmountInCents?: number;
  suggestedActionLabel: string;
};
