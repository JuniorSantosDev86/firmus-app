"use client";

import { useEffect, useState } from "react";

type PrivacyFoundationResponse = {
  ok: boolean;
  privacy?: {
    version: string;
    lastReviewedAt: string | null;
    dataSurfaces: Array<unknown>;
  };
  securityAudit?: Array<{
    action: string;
    occurredAt: string;
  }>;
};

type LoadState = "loading" | "idle" | "error";

function formatDate(value: string | null): string {
  if (!value) {
    return "Ainda não registrada";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Ainda não registrada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

export function PrivacyFoundationPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [snapshot, setSnapshot] = useState<PrivacyFoundationResponse | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/internal/privacy-foundation/status", {
      method: "GET",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!active) {
          return;
        }

        if (!response.ok) {
          setState("error");
          return;
        }

        const payload = (await response.json()) as PrivacyFoundationResponse;
        if (!active) {
          return;
        }

        setSnapshot(payload);
        setState("idle");
      })
      .catch(() => {
        if (active) {
          setState("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const lastReviewedAt = snapshot?.privacy?.lastReviewedAt ?? null;
  const dataSurfaceCount = snapshot?.privacy?.dataSurfaces.length ?? 0;
  const auditCount = snapshot?.securityAudit?.length ?? 0;

  return (
    <section className="firmus-panel space-y-4" data-testid="privacy-foundation-panel">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Segurança e LGPD</h2>
        <p className="text-sm text-muted-foreground">
          Fundação mínima ativa para auditoria de segurança e mapeamento de dados sensíveis.
        </p>
      </div>

      {state === "error" ? (
        <p className="rounded-lg border border-[#FECACA] bg-[#FFF1F2] px-3 py-2 text-sm text-[#9F1239]" data-testid="privacy-foundation-error">
          Não foi possível carregar o status de segurança e privacidade.
        </p>
      ) : null}

      <dl className="grid gap-3 text-sm sm:grid-cols-3" data-testid="privacy-foundation-status">
        <div>
          <dt className="text-muted-foreground">Última revisão</dt>
          <dd className="mt-1 font-medium text-foreground" data-testid="privacy-foundation-last-reviewed">
            {state === "loading" ? "Carregando..." : formatDate(lastReviewedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Superfícies mapeadas</dt>
          <dd className="mt-1 font-medium text-foreground" data-testid="privacy-foundation-surface-count">
            {state === "loading" ? "..." : dataSurfaceCount}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Eventos auditáveis recentes</dt>
          <dd className="mt-1 font-medium text-foreground" data-testid="privacy-foundation-audit-count">
            {state === "loading" ? "..." : auditCount}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-[#475569]" data-testid="privacy-foundation-note">
        A revisão da fundação pode ser registrada via endpoint interno protegido
        <span className="font-mono"> /api/internal/privacy-foundation/review</span>.
      </p>
    </section>
  );
}
