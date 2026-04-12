import type { Metadata } from "next";
import Link from "next/link";

import { FinancialOverviewSummary } from "@/components/financial-overview-summary";

export const metadata: Metadata = {
  title: "Financial Overview",
  description: "Simple operational snapshot of current charge receivables.",
};

export default function FinancialOverviewPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <div className="space-y-8">
        <header className="space-y-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Financial Overview
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Quick snapshot of available, upcoming, and overdue receivables.
            </p>
          </div>
        </header>

        <FinancialOverviewSummary />
      </div>
    </main>
  );
}
