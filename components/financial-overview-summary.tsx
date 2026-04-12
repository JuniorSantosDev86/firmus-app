"use client";

import { useEffect, useState } from "react";

import { getCharges } from "@/lib/charge-storage";
import {
  getFinancialOverview,
  type FinancialOverview,
} from "@/lib/financial-overview";

const EMPTY_OVERVIEW: FinancialOverview = {
  availableTodayInCents: 0,
  receivableIn7DaysInCents: 0,
  overdueAmountInCents: 0,
};

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
}

export function FinancialOverviewSummary() {
  const [overview, setOverview] = useState<FinancialOverview>(EMPTY_OVERVIEW);

  useEffect(() => {
    const charges = getCharges();
    const nextOverview = getFinancialOverview(charges);

    queueMicrotask(() => {
      setOverview(nextOverview);
    });
  }, []);

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-background px-4 py-4">
          <p className="text-sm text-muted-foreground">Available today</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {formatMoneyFromCents(overview.availableTodayInCents)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Pending charges due today or already overdue.
          </p>
        </article>

        <article className="rounded-xl border border-border bg-background px-4 py-4">
          <p className="text-sm text-muted-foreground">Receivable in 7 days</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {formatMoneyFromCents(overview.receivableIn7DaysInCents)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Pending charges due from tomorrow to the next 7 days.
          </p>
        </article>

        <article className="rounded-xl border border-border bg-background px-4 py-4">
          <p className="text-sm text-muted-foreground">Overdue amount</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {formatMoneyFromCents(overview.overdueAmountInCents)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Charges currently resolved as overdue.
          </p>
        </article>
      </div>
    </section>
  );
}
