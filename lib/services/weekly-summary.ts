import { getChargeStatus } from "@/lib/charge-status";
import { getCharges } from "@/lib/charge-storage";
import type { Charge, Reminder } from "@/lib/domain";
import type {
  WeeklySummary,
  WeeklySummaryActivityItem,
  WeeklySummaryChargeItem,
  WeeklySummaryReminderItem,
} from "@/lib/domain/weekly-summary";
import { getReminders } from "@/lib/reminder-storage";
import { getTimelineEvents } from "@/lib/storage/timeline-events";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RECENT_ACTIVITY_LIMIT = 8;
const DUE_SOON_DAYS = 7;

function toStartOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDateKeyFromIso(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return toDateKey(parsed);
}

function dateKeyToUtcMs(dateKey: string): number {
  return new Date(`${dateKey}T00:00:00.000Z`).getTime();
}

function toChargeSummaryItem(charge: Charge): WeeklySummaryChargeItem {
  return {
    id: charge.id,
    clientId: charge.clientId,
    amountInCents: charge.amountInCents,
    dueDate: charge.dueDate,
  };
}

function toReminderSummaryItem(reminder: Reminder): WeeklySummaryReminderItem {
  return {
    id: reminder.id,
    title: reminder.title,
    dueDate: reminder.dueDate,
    completedAt: reminder.completedAt,
    clientId: reminder.clientId,
  };
}

function toActivityItem(event: {
  id: string;
  type: string;
  entityType: "client" | "service" | "quote" | "charge" | "reminder";
  entityId: string;
  timestamp: number;
}): WeeklySummaryActivityItem {
  return {
    id: event.id,
    type: event.type,
    entityType: event.entityType,
    entityId: event.entityId,
    timestamp: event.timestamp,
  };
}

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function buildHighlights(summary: WeeklySummary): string[] {
  const highlights: string[] = [];

  if (summary.sections.overdueCharges.length > 0) {
    highlights.push(
      `${summary.sections.overdueCharges.length} cobrança(s) em atraso somando ${formatMoneyFromCents(
        summary.totals.overdueChargesInCents
      )}.`
    );
  }

  if (summary.totals.pendingRemindersCount > 0) {
    highlights.push(`${summary.totals.pendingRemindersCount} lembrete(s) pendente(s) para acompanhamento.`);
  }

  if (summary.totals.chargesPaidInPeriodInCents > 0) {
    highlights.push(
      `Recebimentos confirmados no período: ${formatMoneyFromCents(summary.totals.chargesPaidInPeriodInCents)}.`
    );
  }

  if (summary.sections.recentActivity.length === 0) {
    highlights.push("Nenhuma atividade recente no período selecionado.");
  }

  if (highlights.length === 0) {
    highlights.push("Sem pendências ou recebimentos registrados no período.");
  }

  return highlights;
}

export function getWeeklySummaryForRange(start: Date, end: Date): WeeklySummary {
  const rangeStartDate = toStartOfUtcDay(start);
  const rangeEndDay = toStartOfUtcDay(end);
  const rangeEndMs = rangeEndDay.getTime() + DAY_IN_MS - 1;

  const rangeStartKey = toDateKey(rangeStartDate);
  const rangeEndKey = toDateKey(rangeEndDay);

  const charges = getCharges();
  const reminders = getReminders();
  const timelineEvents = getTimelineEvents();

  const pendingCharges = charges.filter((charge) => getChargeStatus(charge) !== "paid");
  const overdueCharges = pendingCharges
    .filter((charge) => getChargeStatus(charge) === "overdue")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const referenceDayMs = rangeEndDay.getTime();
  const dueSoonLimitMs = referenceDayMs + DUE_SOON_DAYS * DAY_IN_MS;

  const dueSoonCharges = pendingCharges
    .filter((charge) => {
      const dueKey = toDateKeyFromIso(charge.dueDate);
      if (dueKey === null) {
        return false;
      }

      const dueMs = dateKeyToUtcMs(dueKey);
      return dueMs >= referenceDayMs && dueMs <= dueSoonLimitMs;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const pendingReminders = reminders
    .filter((reminder) => reminder.status === "pending")
    .sort((a, b) => {
      const aDue = a.dueDate ?? "9999-12-31T00:00:00.000Z";
      const bDue = b.dueDate ?? "9999-12-31T00:00:00.000Z";
      if (aDue !== bDue) {
        return aDue.localeCompare(bDue);
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    });

  const completedRemindersInPeriod = reminders
    .filter((reminder) => {
      if (reminder.status !== "done" || !reminder.completedAt) {
        return false;
      }

      const completedAtMs = new Date(reminder.completedAt).getTime();
      if (Number.isNaN(completedAtMs)) {
        return false;
      }

      return completedAtMs >= rangeStartDate.getTime() && completedAtMs <= rangeEndMs;
    })
    .sort((a, b) => (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt));

  const paidChargeIdsInPeriod = new Set(
    timelineEvents
      .filter((event) => {
        if (event.type !== "charge_paid" || event.entityType !== "charge") {
          return false;
        }

        return event.timestamp >= rangeStartDate.getTime() && event.timestamp <= rangeEndMs;
      })
      .map((event) => event.entityId)
  );

  const chargesPaidInPeriodInCents = charges
    .filter((charge) => paidChargeIdsInPeriod.has(charge.id))
    .reduce((acc, charge) => acc + charge.amountInCents, 0);

  const recentActivity = timelineEvents
    .filter((event) => event.timestamp >= rangeStartDate.getTime() && event.timestamp <= rangeEndMs)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map((event) => toActivityItem(event));

  const summary: WeeklySummary = {
    rangeStart: rangeStartDate.toISOString(),
    rangeEnd: new Date(rangeEndMs).toISOString(),
    totals: {
      chargesPaidInPeriodInCents,
      chargesPendingInCents: pendingCharges.reduce((acc, charge) => acc + charge.amountInCents, 0),
      overdueChargesInCents: overdueCharges.reduce((acc, charge) => acc + charge.amountInCents, 0),
      pendingRemindersCount: pendingReminders.length,
      completedRemindersInPeriodCount: completedRemindersInPeriod.length,
    },
    sections: {
      dueSoonCharges: dueSoonCharges.map((charge) => toChargeSummaryItem(charge)),
      overdueCharges: overdueCharges.map((charge) => toChargeSummaryItem(charge)),
      pendingReminders: pendingReminders.map((reminder) => toReminderSummaryItem(reminder)),
      completedRemindersInPeriod: completedRemindersInPeriod.map((reminder) =>
        toReminderSummaryItem(reminder)
      ),
      recentActivity,
    },
    highlights: [],
  };

  summary.highlights = buildHighlights(summary);

  // Keep period explicit and stable for rendering and inspection.
  summary.rangeStart = `${rangeStartKey}T00:00:00.000Z`;
  summary.rangeEnd = `${rangeEndKey}T23:59:59.999Z`;

  return summary;
}

export function getWeeklySummary(referenceDate: Date = new Date()): WeeklySummary {
  const end = toStartOfUtcDay(referenceDate);
  const start = new Date(end.getTime() - 6 * DAY_IN_MS);
  return getWeeklySummaryForRange(start, end);
}
