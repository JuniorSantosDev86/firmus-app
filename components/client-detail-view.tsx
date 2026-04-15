"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getChargeStatus } from "@/lib/charge-status";
import {
  getClientDetailSnapshot,
  type ClientDetailSnapshot,
} from "@/lib/client-detail";

type ClientDetailViewProps = {
  clientId: string;
};

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("pt-BR");
}

function formatTimestamp(value: number): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString("pt-BR");
}

function displayValue(value: string | null): string {
  return value && value.length > 0 ? value : "—";
}

function getTimelineLabel(type: string): string {
  if (type === "client_created") {
    return "Cliente criado";
  }

  if (type === "quote_created") {
    return "Orçamento criado";
  }

  if (type === "quote_approved") {
    return "Orçamento aprovado";
  }

  if (type === "charge_created") {
    return "Cobrança criada";
  }

  if (type === "charge_paid") {
    return "Cobrança marcada como paga";
  }

  if (type === "reminder_created") {
    return "Lembrete criado";
  }

  if (type === "reminder_completed") {
    return "Lembrete concluído";
  }

  return type.replaceAll("_", " ");
}

function getQuoteStatusLabel(status: string): string {
  if (status === "draft") return "Rascunho";
  if (status === "sent") return "Enviado";
  if (status === "approved") return "Aprovado";
  if (status === "rejected") return "Rejeitado";
  if (status === "expired") return "Expirado";
  if (status === "canceled") return "Cancelado";
  return status;
}

function getChargeStatusLabel(status: string): string {
  if (status === "pending") return "Pendente";
  if (status === "paid") return "Pago";
  if (status === "overdue") return "Em atraso";
  return status;
}

function getEntityTypeLabel(type: string): string {
  if (type === "client") return "Cliente";
  if (type === "service") return "Serviço";
  if (type === "quote") return "Orçamento";
  if (type === "charge") return "Cobrança";
  if (type === "reminder") return "Lembrete";
  return type;
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const [snapshot, setSnapshot] = useState<ClientDetailSnapshot | null>(null);

  useEffect(() => {
    const next = getClientDetailSnapshot(clientId);
    queueMicrotask(() => {
      setSnapshot(next);
    });
  }, [clientId]);

  if (snapshot === null) {
    return (
        <section className="firmus-panel">
        <p className="text-sm text-muted-foreground">Carregando detalhe do cliente...</p>
      </section>
    );
  }

  if (snapshot.client === null) {
    return (
      <section className="firmus-panel">
        <header className="space-y-3">
          <Link
            href="/clients"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Voltar para clientes
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Cliente não encontrado
          </h1>
          <p className="text-sm text-muted-foreground">
            Não foi possível encontrar o cliente solicitado.
          </p>
        </header>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="firmus-panel">
        <header className="space-y-3">
          <Link
            href="/clients"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Voltar para clientes
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {snapshot.client.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Resumo do cliente com orçamentos, cobranças e linha do tempo relacionadas.
            </p>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>WhatsApp: {displayValue(snapshot.client.whatsapp)}</p>
            <p>Email: {displayValue(snapshot.client.email)}</p>
            <p>Cidade: {displayValue(snapshot.client.city)}</p>
            <p>Observações: {displayValue(snapshot.client.notes)}</p>
          </div>
        </header>
      </section>

      <section className="firmus-panel">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Orçamentos relacionados
        </h2>
        {snapshot.quotes.length === 0 ? (
          <p className="mt-4 firmus-empty-state">
            Nenhum orçamento vinculado a este cliente.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {snapshot.quotes.map((quote) => (
              <li
                key={quote.id}
                className="firmus-list-card"
              >
                <p className="font-medium text-foreground">
                  {formatMoneyFromCents(quote.totalInCents)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getQuoteStatusLabel(quote.status)} • Emissão {formatDate(quote.issueDate)}
                  {quote.validUntil ? ` • Válido até ${formatDate(quote.validUntil)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="firmus-panel">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Cobranças relacionadas
        </h2>
        {snapshot.charges.length === 0 ? (
          <p className="mt-4 firmus-empty-state">
            Nenhuma cobrança vinculada a este cliente.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {snapshot.charges.map((charge) => (
              <li
                key={charge.id}
                className="firmus-list-card"
              >
                <p className="font-medium text-foreground">
                  {formatMoneyFromCents(charge.amountInCents)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getChargeStatusLabel(getChargeStatus(charge))} • Vence em {formatDate(charge.dueDate)}
                  {charge.quoteId ? " • Orçamento vinculado" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="firmus-panel">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Linha do tempo consolidada
        </h2>
        {snapshot.timelineEvents.length === 0 ? (
          <p className="mt-4 firmus-empty-state">
            Nenhum evento de linha do tempo para este contexto de cliente.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {snapshot.timelineEvents.map((event) => (
              <li
                key={event.id}
                className="firmus-list-card"
              >
                <p className="font-medium text-foreground">{getTimelineLabel(event.type)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getEntityTypeLabel(event.entityType)} • {formatTimestamp(event.timestamp)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
