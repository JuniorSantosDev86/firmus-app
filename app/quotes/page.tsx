import type { Metadata } from "next";
import Link from "next/link";

import { QuotesManager } from "@/components/quotes-manager";

export const metadata: Metadata = {
  title: "Quotes",
  description: "Create and manage quotes with linked clients and item totals.",
};

export default function QuotesPage() {
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
              Quotes
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Build quotes with clients, reusable services, and clear totals.
            </p>
          </div>
        </header>

        <QuotesManager />
      </div>
    </main>
  );
}
