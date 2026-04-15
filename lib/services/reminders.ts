import { createTimelineEvent } from "@/lib/services/timeline";
import {
  createReminder as createReminderInStorage,
  getReminders,
  markReminderAsDone as markReminderAsDoneInStorage,
  type CreateReminderInput,
} from "@/lib/reminder-storage";
import type { Reminder } from "@/lib/domain/reminder";

export type ReminderWithDerivedState = Reminder & {
  isOverdue: boolean;
  isDueToday: boolean;
  isUpcoming: boolean;
};

export type ReminderGroups = {
  pending: ReminderWithDerivedState[];
  done: ReminderWithDerivedState[];
  overdue: ReminderWithDerivedState[];
  dueToday: ReminderWithDerivedState[];
  upcoming: ReminderWithDerivedState[];
};

function toDateKey(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-${String(
    parsed.getUTCDate()
  ).padStart(2, "0")}`;
}

function getTodayKey(referenceDate: Date = new Date()): string {
  return `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}-${String(
    referenceDate.getDate()
  ).padStart(2, "0")}`;
}

function sortPending(a: ReminderWithDerivedState, b: ReminderWithDerivedState): number {
  const aDue = a.dueDate ? toDateKey(a.dueDate) : null;
  const bDue = b.dueDate ? toDateKey(b.dueDate) : null;

  if (aDue && bDue) {
    if (aDue !== bDue) {
      return aDue.localeCompare(bDue);
    }

    return b.updatedAt.localeCompare(a.updatedAt);
  }

  if (aDue && !bDue) {
    return -1;
  }

  if (!aDue && bDue) {
    return 1;
  }

  return b.updatedAt.localeCompare(a.updatedAt);
}

function sortDone(a: ReminderWithDerivedState, b: ReminderWithDerivedState): number {
  const aDate = a.completedAt ?? a.updatedAt;
  const bDate = b.completedAt ?? b.updatedAt;
  return bDate.localeCompare(aDate);
}

export function getReminderGroups(referenceDate: Date = new Date()): ReminderGroups {
  const reminders = getReminders();
  const todayKey = getTodayKey(referenceDate);

  const pending: ReminderWithDerivedState[] = [];
  const done: ReminderWithDerivedState[] = [];

  for (const reminder of reminders) {
    const dueKey = reminder.dueDate ? toDateKey(reminder.dueDate) : null;

    const enriched: ReminderWithDerivedState = {
      ...reminder,
      isOverdue: reminder.status === "pending" && dueKey !== null && dueKey < todayKey,
      isDueToday: reminder.status === "pending" && dueKey !== null && dueKey === todayKey,
      isUpcoming: reminder.status === "pending" && dueKey !== null && dueKey > todayKey,
    };

    if (enriched.status === "done") {
      done.push(enriched);
    } else {
      pending.push(enriched);
    }
  }

  const sortedPending = pending.sort(sortPending);
  const sortedDone = done.sort(sortDone);

  return {
    pending: sortedPending,
    done: sortedDone,
    overdue: sortedPending.filter((item) => item.isOverdue),
    dueToday: sortedPending.filter((item) => item.isDueToday),
    upcoming: sortedPending.filter((item) => item.isUpcoming),
  };
}

export function createReminder(input: CreateReminderInput): Reminder | null {
  const created = createReminderInStorage(input);

  if (!created) {
    return null;
  }

  createTimelineEvent({
    type: "reminder_created",
    entityType: "reminder",
    entityId: created.id,
    metadata: {
      clientId: created.clientId,
      chargeId: created.chargeId,
      sourceType: created.sourceType,
      sourceRuleId: created.sourceRuleId,
      sourceFingerprint: created.sourceFingerprint,
    },
  });

  return created;
}

export function markReminderAsDone(reminderId: string): Reminder | null {
  const updated = markReminderAsDoneInStorage(reminderId);

  if (!updated) {
    return null;
  }

  createTimelineEvent({
    type: "reminder_completed",
    entityType: "reminder",
    entityId: updated.id,
    metadata: {
      clientId: updated.clientId,
      chargeId: updated.chargeId,
      sourceType: updated.sourceType,
    },
  });

  return updated;
}
