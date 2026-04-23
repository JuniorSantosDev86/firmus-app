"use client";

import { CheckCircle2, ChevronRight, Circle, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { OnboardingChecklistSnapshot } from "@/lib/domain";
import { readOnboardingSnapshot } from "@/lib/services/onboarding";
import { PLAN_STATE_UPDATED_EVENT } from "@/lib/storage/plan-state";
import {
  dismissOnboarding,
  ONBOARDING_STATE_UPDATED_EVENT,
} from "@/lib/storage/onboarding-state";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]" aria-hidden="true">
      <div
        className="h-full rounded-full bg-[#0EA5A4] transition-[width]"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

export function OnboardingCard() {
  const [snapshot, setSnapshot] = useState<OnboardingChecklistSnapshot | null>(null);

  useEffect(() => {
    function refresh() {
      setSnapshot(readOnboardingSnapshot());
    }

    refresh();
    window.addEventListener(ONBOARDING_STATE_UPDATED_EVENT, refresh);
    window.addEventListener(PLAN_STATE_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(ONBOARDING_STATE_UPDATED_EVENT, refresh);
      window.removeEventListener(PLAN_STATE_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (snapshot === null || snapshot.isHiddenInDashboard) {
    return null;
  }

  const visibleSteps = snapshot.checklist.slice(0, 3);

  return (
    <section
      className="rounded-[24px] border border-[#CFEAE9] bg-[linear-gradient(135deg,#F7FFFE_0%,#ECFEFF_100%)] p-6 shadow-[0_18px_40px_-32px_rgba(8,124,123,0.4)]"
      data-testid="onboarding-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#0B6D6D] uppercase">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Onboarding inicial
          </p>
          <h2 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">
            {snapshot.status === "completed"
              ? "Base inicial concluída"
              : "Complete os passos iniciais para começar a operar mais rápido."}
          </h2>
          <p className="max-w-3xl text-sm text-[#475569]">
            {snapshot.status === "completed"
              ? "Sua base principal já está configurada. Use esta área apenas como referência rápida."
              : `Você já concluiu ${snapshot.progress.completedCount} de ${snapshot.progress.totalSteps} etapas.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => dismissOnboarding()}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#D5E9E8] bg-white px-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC]"
          data-testid="onboarding-card-dismiss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Ocultar
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm text-[#475569]">
          <span>Progresso atual</span>
          <span className="font-medium text-[#0F172A]">{snapshot.progress.completionPercentage}%</span>
        </div>
        <ProgressBar value={snapshot.progress.completionPercentage} />
      </div>

      {snapshot.nextRecommendedStep ? (
        <div
          className="mt-5 rounded-[18px] border border-[#D6EEED] bg-white px-5 py-4"
          data-testid="onboarding-next-step"
        >
          <p className="text-xs font-semibold tracking-[0.12em] text-[#64748B] uppercase">
            Próximo passo recomendado
          </p>
          <h3 className="mt-2 text-base font-semibold text-[#0F172A]">{snapshot.nextRecommendedStep.title}</h3>
          <p className="mt-1 text-sm text-[#64748B]">{snapshot.nextRecommendedStep.description}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={snapshot.nextRecommendedStep.href}
              className="inline-flex h-9 items-center rounded-lg border border-[#B6E9E8] bg-[#E9FAFA] px-3 text-sm font-semibold text-[#0B6D6D] transition-colors hover:bg-[#DDF4F3]"
              data-testid="onboarding-next-step-cta"
            >
              {snapshot.nextRecommendedStep.ctaLabel}
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex h-9 items-center rounded-lg border border-[#D8E3EE] bg-white px-3 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC]"
              data-testid="onboarding-card-open-page"
            >
              Ver checklist completo
            </Link>
          </div>
        </div>
      ) : null}

      <ul className="mt-5 space-y-3" data-testid="onboarding-card-checklist">
        {visibleSteps.map((step) => (
          <li
            key={step.key}
            className="flex items-start justify-between gap-3 rounded-[16px] border border-[#DCE5EF] bg-white px-4 py-3"
          >
            <div className="flex items-start gap-3">
              {step.completed ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#0EA5A4]" aria-hidden="true" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 text-[#94A3B8]" aria-hidden="true" />
              )}
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{step.title}</p>
                <p className="mt-1 text-sm text-[#64748B]">{step.completionLabel}</p>
              </div>
            </div>
            <Link href={step.href} className="text-sm font-medium text-[#0B6D6D]">
              <span className="inline-flex items-center gap-1">
                Abrir
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
