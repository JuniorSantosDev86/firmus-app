import type { TimelineEvent } from "@/lib/domain/timeline-event";
import { addTimelineEvent } from "@/lib/storage/timeline-events";

type CreateTimelineEventParams = {
  type: string;
  entityId: string;
  entityType: TimelineEvent["entityType"];
  metadata?: Record<string, unknown>;
};

function generateTimelineEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `timeline_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

export function createTimelineEvent(params: CreateTimelineEventParams): TimelineEvent {
  const event: TimelineEvent = {
    id: generateTimelineEventId(),
    type: params.type,
    timestamp: Date.now(),
    entityId: params.entityId,
    entityType: params.entityType,
  };

  if (params.metadata !== undefined) {
    event.metadata = params.metadata;
  }

  addTimelineEvent(event);
  return event;
}
