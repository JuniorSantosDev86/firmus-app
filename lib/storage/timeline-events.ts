import type { TimelineEvent } from "@/lib/domain/timeline-event";

const STORAGE_KEY = "firmus.timelineEvents";

function normalizeTimelineEvent(raw: unknown): TimelineEvent | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;

  if (
    typeof data.id !== "string" ||
    typeof data.type !== "string" ||
    typeof data.timestamp !== "number" ||
    !Number.isFinite(data.timestamp) ||
    typeof data.entityId !== "string" ||
    (data.entityType !== "client" &&
      data.entityType !== "service" &&
      data.entityType !== "quote" &&
      data.entityType !== "charge")
  ) {
    return null;
  }

  const event: TimelineEvent = {
    id: data.id,
    type: data.type,
    timestamp: data.timestamp,
    entityId: data.entityId,
    entityType: data.entityType,
  };

  if (
    typeof data.metadata === "object" &&
    data.metadata !== null &&
    !Array.isArray(data.metadata)
  ) {
    event.metadata = data.metadata as Record<string, unknown>;
  }

  return event;
}

export function getTimelineEvents(): TimelineEvent[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeTimelineEvent(item))
      .filter((event): event is TimelineEvent => event !== null);
  } catch {
    return [];
  }
}

export function addTimelineEvent(event: TimelineEvent): void {
  if (typeof window === "undefined") {
    return;
  }

  const existing = getTimelineEvents();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, event]));
}
