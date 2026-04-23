import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { OnboardingPageContent } from "@/components/onboarding/onboarding-page-content";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Checklist inicial guiado para configurar a base operacional no Firmus.",
};

export default function OnboardingPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8">
      <PageHeader
        title="Onboarding"
        description="Complete os passos iniciais para começar a operar mais rápido, com base no estado real da sua operação."
      />
      <OnboardingPageContent />
    </main>
  );
}
