import type { Metadata } from "next";
import Link from "next/link";

import { ChargesManager } from "@/components/charges-manager";

export const metadata: Metadata = {
  title: "Charges",
  description: "Create and manage charges linked to clients and optional quotes.",
};

export default function ChargesPage() {
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
              Charges
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Register expected amounts from clients with due dates and status.
            </p>
          </div>
        </header>

        <ChargesManager />
      </div>
    </main>
  );
}
