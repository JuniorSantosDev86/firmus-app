"use client";

import { useEffect, useState, type ReactNode } from "react";

import type { PlanFeatureKey } from "@/lib/domain/plan";
import {
  getFeatureAccessState,
  type FeatureAccessState,
} from "@/lib/services/plan-entitlements";
import { PLAN_STATE_UPDATED_EVENT } from "@/lib/storage/plan-state";
import { PlanBlockedState } from "@/components/plan/plan-blocked-state";

type PlanFeatureGuardProps = {
  feature: PlanFeatureKey;
  children: ReactNode;
  blockedTestId?: string;
};

export function PlanFeatureGuard({
  feature,
  children,
  blockedTestId,
}: PlanFeatureGuardProps) {
  const [access, setAccess] = useState<FeatureAccessState | null>(null);

  useEffect(() => {
    function refresh() {
      setAccess(getFeatureAccessState(feature));
    }

    refresh();
    window.addEventListener(PLAN_STATE_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(PLAN_STATE_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [feature]);

  if (access === null) {
    return (
      <section className="firmus-panel" data-testid={`plan-feature-loading-${feature}`}>
        <p className="text-sm text-muted-foreground">Verificando disponibilidade do recurso...</p>
      </section>
    );
  }

  if (access.blocked) {
    return <PlanBlockedState access={access} testId={blockedTestId} />;
  }

  return <>{children}</>;
}
