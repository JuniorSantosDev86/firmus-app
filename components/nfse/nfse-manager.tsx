"use client";

import { useEffect, useState } from "react";

import { NFSeEmptyState } from "@/components/nfse/nfse-empty-state";
import { NFSeReadinessCard } from "@/components/nfse/nfse-readiness-card";
import { NFSeStatusBadge } from "@/components/nfse/nfse-status-badge";
import { readBusinessProfile } from "@/lib/business-profile-storage";
import type { BusinessProfile, NFSeRecord } from "@/lib/domain";
import { readNFSeRecords } from "@/lib/nfse-storage";
import { evaluateBusinessProfileNFSeReadiness } from "@/lib/services/nfse/nfse-readiness";

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function getTaxRegimeLabel(value: BusinessProfile["taxRegime"]): string {
  if (value === "mei") {
    return "MEI";
  }

  if (value === "simples") {
    return "Simples Nacional";
  }

  if (value === "outro") {
    return "Outro";
  }

  return "—";
}

function displayValue(value: string | null | undefined): string {
  if (!value || value.trim().length === 0) {
    return "—";
  }

  return value;
}

export function NFSeManager() {
  const [records, setRecords] = useState<NFSeRecord[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    const storedRecords = readNFSeRecords();
    const storedProfile = readBusinessProfile();

    queueMicrotask(() => {
      setRecords(storedRecords);
      setProfile(storedProfile);
    });
  }, []);

  const readiness = evaluateBusinessProfileNFSeReadiness(profile);

  return (
    <div className="space-y-6">
      <NFSeReadinessCard readiness={readiness} testId="nfse-readiness-card-page" />

      <section className="firmus-panel" data-testid="nfse-business-snapshot-panel">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Snapshot fiscal atual da empresa
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nome da empresa</dt>
            <dd className="mt-1 font-medium text-foreground">
              {displayValue(profile?.businessName ?? null)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">CNPJ</dt>
            <dd className="mt-1 font-medium text-foreground">
              {displayValue(profile?.cnpj)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Inscrição municipal</dt>
            <dd className="mt-1 font-medium text-foreground">
              {displayValue(profile?.municipalRegistration)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Cidade de prestação</dt>
            <dd className="mt-1 font-medium text-foreground">
              {displayValue(profile?.serviceCity)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Regime tributário</dt>
            <dd className="mt-1 font-medium text-foreground">
              {getTaxRegimeLabel(profile?.taxRegime ?? null)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="firmus-panel" data-testid="nfse-records-panel">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Registros internos de NFSe
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {records.length === 0
                ? "Nenhum registro preparado."
                : `${records.length} registro${records.length === 1 ? "" : "s"} preparado${records.length === 1 ? "" : "s"}.`}
            </p>
          </div>
        </div>

        {records.length === 0 ? (
          <NFSeEmptyState />
        ) : (
          <ul className="space-y-3">
            {records.map((record) => (
              <li key={record.id} className="firmus-list-card sm:px-5" data-testid={`nfse-record-${record.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-[#0F172A]">
                      {record.clientSnapshot.name}
                    </p>
                    <p className="text-sm text-[#334155]">{record.description}</p>
                    <p className="text-xs text-[#64748B]">
                      Competência: {record.competenceDate.slice(0, 10)} • Cidade: {record.serviceCity}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Cobrança: {record.chargeId.slice(0, 8)} • Valor: {formatMoneyFromCents(record.amountInCents)}
                    </p>
                  </div>
                  <NFSeStatusBadge status={record.issueStatus} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
