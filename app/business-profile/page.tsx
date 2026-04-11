import type { Metadata } from "next";
import Link from "next/link";

import { BusinessProfileForm } from "@/components/business-profile-form";

export const metadata: Metadata = {
  title: "Business Profile",
  description: "Manage your business identity details.",
};

export default function BusinessProfilePage() {
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
              Business Profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep your business identity up to date for future client and
              quote flows.
            </p>
          </div>
        </header>

        <BusinessProfileForm />
      </div>
    </main>
  );
}
