import type { Charge, ChargeStatus } from "@/lib/domain";

export type ResolvedChargeStatus = ChargeStatus | "overdue";

function toDateOnlyKey(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getChargeStatus(charge: Charge): ResolvedChargeStatus {
  if (charge.status !== "pending") {
    return charge.status;
  }

  const dueDateKey = toDateOnlyKey(charge.dueDate);
  if (dueDateKey === null) {
    return "pending";
  }

  return dueDateKey < getTodayDateKey() ? "overdue" : "pending";
}
