export interface TimelineEvent {
  id: string;
  type: string;
  timestamp: number;
  entityId: string;
  entityType: "client" | "service" | "quote" | "charge" | "reminder";
  metadata?: Record<string, unknown>;
}
