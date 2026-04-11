import type { Metadata } from "next";
import Link from "next/link";

import { ServicesManager } from "@/components/services-manager";

export const metadata: Metadata = {
  title: "Services",
  description: "Manage your services with a simple and reliable flow.",
};

export default function ServicesPage() {
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
              Services
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Define the services you offer so upcoming quotes can reuse them.
            </p>
          </div>
        </header>

        <ServicesManager />
      </div>
    </main>
  );
}
