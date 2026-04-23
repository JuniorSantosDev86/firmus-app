"use client";

import { CheckCircle2, Circle, RotateCcw, SkipForward } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { OnboardingChecklistSnapshot, OnboardingStepState } from "@/lib/domain";
import { readOnboardingSnapshot } from "@/lib/services/onboarding";
import { PLAN_STATE_UPDATED_EVENT } from "@/lib/storage/plan-state";
import {
  ONBOARDING_STATE_UPDATED_EVENT,
  reopenOnboarding,
  restoreSkippedOnboardingSteps,
  skipOnboardingStep,
} from "@/lib/storage/onboarding-state";

function StepStatusBadge({ step }: { step: OnboardingStepState }) {
  const className = step.completed
    ? "border-[#B6E9E8] bg-[#ECFEFF] text-[#0B6D6D]"
    : step.optional
      ? "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]"
      : "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{step.completionLabel}</span>;
}

export function OnboardingPageContent() {
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

  if (snapshot === null) {
    return (
      <section className="firmus-panel" data-testid="onboarding-page-loading">
        <p className="text-sm text-muted-foreground">Carregando checklist de onboarding...</p>
      </section>
    );
  }

  return (
    <div className="space-y-6" data-testid="onboarding-page">
      <section className="firmus-panel space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Plano atual: <span className="font-medium text-foreground">{snapshot.currentPlanLabel}</span>
            </p>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Acompanhe a configuração inicial com base no estado real do workspace. O checklist adapta as etapas ao
              que já foi concluído e ao que faz sentido no seu plano atual.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {snapshot.isHiddenInDashboard || snapshot.status === "dismissed" ? (
              <Button type="button" variant="outline" onClick={() => reopenOnboarding()} data-testid="onboarding-reopen-dashboard">
                Mostrar novamente no dashboard
              </Button>
            ) : null}
            {snapshot.skippedOptionalStepsCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => restoreSkippedOnboardingSteps()}
                data-testid="onboarding-restore-skipped"
              >
                Restaurar etapas opcionais
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-sm text-muted-foreground">Etapas concluídas</p>
            <p className="mt-2 text-2xl font-semibold text-foreground" data-testid="onboarding-progress-count">
              {snapshot.progress.completedCount}/{snapshot.progress.totalSteps}
            </p>
          </article>
          <article className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-sm text-muted-foreground">Pendências atuais</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{snapshot.progress.remainingCount}</p>
          </article>
          <article className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {snapshot.status === "completed"
                ? "Concluído"
                : snapshot.status === "dismissed"
                  ? "Oculto"
                  : "Ativo"}
            </p>
          </article>
        </div>

        {snapshot.nextRecommendedStep ? (
          <div className="rounded-2xl border border-[#CFEAE9] bg-[#F7FFFE] p-4" data-testid="onboarding-page-next-step">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#0B6D6D] uppercase">Próximo passo recomendado</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">{snapshot.nextRecommendedStep.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{snapshot.nextRecommendedStep.description}</p>
            <Link
              href={snapshot.nextRecommendedStep.href}
              className="mt-4 inline-flex h-9 items-center rounded-lg border border-[#B6E9E8] bg-[#E9FAFA] px-3 text-sm font-semibold text-[#0B6D6D] transition-colors hover:bg-[#DDF4F3]"
              data-testid="onboarding-page-next-step-cta"
            >
              {snapshot.nextRecommendedStep.ctaLabel}
            </Link>
          </div>
        ) : null}
      </section>

      <section className="firmus-panel">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Checklist guiado</h2>
          <p className="text-sm text-muted-foreground">
            Use os links diretos para concluir o que falta sem transformar o fluxo em um wizard obrigatório.
          </p>
        </div>

        <ul className="space-y-4" data-testid="onboarding-checklist">
          {snapshot.checklist.map((step) => (
            <li
              key={step.key}
              className="rounded-[18px] border border-[#E2E8F0] bg-white px-5 py-4"
              data-testid={`onboarding-step-${step.key}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#0EA5A4]" aria-hidden="true" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 text-[#94A3B8]" aria-hidden="true" />
                  )}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                      <StepStatusBadge step={step} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    {step.helperText ? <p className="mt-2 text-sm text-[#0B6D6D]">{step.helperText}</p> : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={step.href}
                    className="inline-flex h-9 items-center rounded-lg border border-[#B6E9E8] bg-[#E9FAFA] px-3 text-sm font-semibold text-[#0B6D6D] transition-colors hover:bg-[#DDF4F3]"
                  >
                    {step.ctaLabel}
                  </Link>
                  {!step.completed && step.optional ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => skipOnboardingStep(step.key)}
                      data-testid={`onboarding-skip-${step.key}`}
                    >
                      <SkipForward className="h-4 w-4" aria-hidden="true" />
                      Pular por agora
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {snapshot.status === "completed" ? (
          <div
            className="mt-5 rounded-2xl border border-[#CFEAE9] bg-[#F7FFFE] px-4 py-3 text-sm text-[#0B6D6D]"
            data-testid="onboarding-completed-state"
          >
            Checklist concluído. A partir daqui, siga para os módulos operacionais conforme a rotina do negócio.
          </div>
        ) : null}

        {snapshot.skippedOptionalStepsCount > 0 ? (
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Há etapas opcionais ocultas no momento.
          </div>
        ) : null}
      </section>
    </div>
  );
}
