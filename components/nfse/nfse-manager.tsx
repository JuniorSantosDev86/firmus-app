"use client";

import { useEffect, useState } from "react";

import { NFSeEmptyState } from "@/components/nfse/nfse-empty-state";
import { NFSeReadinessCard } from "@/components/nfse/nfse-readiness-card";
import { NFSeStatusBadge } from "@/components/nfse/nfse-status-badge";
import { Button } from "@/components/ui/button";
import { readBusinessProfile } from "@/lib/business-profile-storage";
import type { BusinessProfile, NFSeRecord } from "@/lib/domain";
import { readNFSeRecords } from "@/lib/nfse-storage";
import { issueNFSeRecord } from "@/lib/services/nfse/nfse-issuance-service";
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

function canIssueNFSe(status: NFSeRecord["issueStatus"]): boolean {
  return status === "ready" || status === "failed";
}

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("pt-BR");
}

export function NFSeManager() {
  const [records, setRecords] = useState<NFSeRecord[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [issuingRecordId, setIssuingRecordId] = useState<string | null>(null);
  const [issuanceFeedbackByRecordId, setIssuanceFeedbackByRecordId] = useState<
    Record<string, string>
  >({});

  function refreshRecords() {
    setRecords(readNFSeRecords());
  }

  useEffect(() => {
    const storedRecords = readNFSeRecords();
    const storedProfile = readBusinessProfile();

    queueMicrotask(() => {
      setRecords(storedRecords);
      setProfile(storedProfile);
    });
  }, []);

  async function handleIssue(record: NFSeRecord) {
    if (!canIssueNFSe(record.issueStatus) || issuingRecordId !== null) {
      return;
    }

    setIssuingRecordId(record.id);
    setIssuanceFeedbackByRecordId((prev) => ({
      ...prev,
      [record.id]: "Emissão iniciada...",
    }));
    refreshRecords();

    const result = await issueNFSeRecord(record.id);
    refreshRecords();
    setIssuingRecordId(null);

    if (!result.ok) {
      setIssuanceFeedbackByRecordId((prev) => ({
        ...prev,
        [record.id]: result.message,
      }));
      return;
    }

    const feedback =
      result.record.issueStatus === "issued"
        ? "NFSe emitida com sucesso."
        : result.record.lastError ?? "Falha ao emitir NFSe.";

    setIssuanceFeedbackByRecordId((prev) => ({
      ...prev,
      [record.id]: feedback,
    }));
  }

  const readiness = evaluateBusinessProfileNFSeReadiness(profile);
  const uniqueRecords = Array.from(new Map(records.map((record) => [record.id, record])).values());

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
                : `${uniqueRecords.length} registro${uniqueRecords.length === 1 ? "" : "s"} preparado${uniqueRecords.length === 1 ? "" : "s"}.`}
            </p>
          </div>
        </div>

        {uniqueRecords.length === 0 ? (
          <NFSeEmptyState />
        ) : (
          <ul className="space-y-3">
            {uniqueRecords.map((record) => {
              const canIssue = canIssueNFSe(record.issueStatus);
              const isIssuing = issuingRecordId === record.id || record.issueStatus === "issuing";
              return (
                <li
                  key={record.id}
                  className="firmus-list-card sm:px-5"
                  data-testid={`nfse-record-${record.id}`}
                >
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
                        Cobrança: {record.chargeId.slice(0, 8)} • Valor:{" "}
                        {formatMoneyFromCents(record.amountInCents)}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Emitida em: {formatDateTime(record.issuedAt)}
                      </p>
                      {record.providerReference ? (
                        <p
                          className="text-xs text-[#64748B]"
                          data-testid={`nfse-record-provider-reference-${record.id}`}
                        >
                          Protocolo/Referência: {record.providerReference}
                        </p>
                      ) : (
                        <p className="text-xs text-[#64748B]">Protocolo/Referência: —</p>
                      )}
                      {record.documentNumber ? (
                        <p
                          className="text-xs text-[#64748B]"
                          data-testid={`nfse-record-document-${record.id}`}
                        >
                          Número da NFSe: {record.documentNumber}
                        </p>
                      ) : (
                        <p className="text-xs text-[#64748B]">Número da NFSe: —</p>
                      )}
                      {record.lastError ? (
                        <p
                          className="text-xs text-[#9F1239]"
                          data-testid={`nfse-record-last-error-${record.id}`}
                        >
                          Erro operacional: {record.lastError}
                        </p>
                      ) : null}
                      {issuanceFeedbackByRecordId[record.id] ? (
                        <p
                          className="text-xs text-[#64748B]"
                          data-testid={`nfse-issue-feedback-${record.id}`}
                        >
                          {issuanceFeedbackByRecordId[record.id]}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2 text-right">
                      <NFSeStatusBadge status={record.issueStatus} />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        data-testid={`nfse-issue-action-${record.id}`}
                        onClick={() => {
                          void handleIssue(record);
                        }}
                        disabled={!canIssue || issuingRecordId !== null || isIssuing}
                      >
                        {isIssuing ? "Emitindo..." : "Emitir NFSe"}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
