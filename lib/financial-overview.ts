import type { Charge } from "@/lib/domain";
import { getChargeStatus } from "@/lib/charge-status";

export type FinancialOverview = {
  availableTodayInCents: number;
  receivableIn7DaysInCents: number;
  overdueAmountInCents: number;
};

function toDateOnlyKey(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function getTodayDateKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function getFinancialOverview(
  charges: Charge[],
  now: Date = new Date()
): FinancialOverview {
  const todayDateKey = getTodayDateKey(now);
  const nextSevenDaysDateKey = addDaysToDateKey(todayDateKey, 7);

  let availableTodayInCents = 0;
  let receivableIn7DaysInCents = 0;
  let overdueAmountInCents = 0;

  for (const charge of charges) {
    const resolvedStatus = getChargeStatus(charge);
    if (resolvedStatus === "paid") {
      continue;
    }

    const dueDateKey = toDateOnlyKey(charge.dueDate);
    if (dueDateKey === null) {
      continue;
    }

    if (resolvedStatus === "overdue") {
      overdueAmountInCents += charge.amountInCents;
    }

    if (dueDateKey <= todayDateKey) {
      availableTodayInCents += charge.amountInCents;
      continue;
    }

    if (dueDateKey <= nextSevenDaysDateKey) {
      receivableIn7DaysInCents += charge.amountInCents;
    }
  }

  return {
    availableTodayInCents,
    receivableIn7DaysInCents,
    overdueAmountInCents,
  };
}
