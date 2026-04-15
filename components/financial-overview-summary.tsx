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
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
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
    <section className="firmus-panel">
      <div className="grid gap-3 sm:grid-cols-3">
        <article
          data-testid="overview-available-today"
          className="firmus-subpanel"
        >
          <p className="text-sm text-muted-foreground">Disponível hoje</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {formatMoneyFromCents(overview.availableTodayInCents)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Cobranças pendentes que vencem hoje ou já estão em atraso.
          </p>
        </article>

        <article
          data-testid="overview-receivable-7-days"
          className="firmus-subpanel"
        >
          <p className="text-sm text-muted-foreground">A receber em 7 dias</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {formatMoneyFromCents(overview.receivableIn7DaysInCents)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Cobranças pendentes com vencimento de amanhã até os próximos 7 dias.
          </p>
        </article>

        <article
          data-testid="overview-overdue"
          className="firmus-subpanel"
        >
          <p className="text-sm text-muted-foreground">Valor em atraso</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {formatMoneyFromCents(overview.overdueAmountInCents)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Cobranças atualmente classificadas como em atraso.
          </p>
        </article>
      </div>
    </section>
  );
}
