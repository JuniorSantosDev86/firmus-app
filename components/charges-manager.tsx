"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getChargeStatus } from "@/lib/charge-status";
import {
  deleteCharge,
  getCharges,
  upsertCharge,
  type ChargeInput,
} from "@/lib/charge-storage";
import { readClients } from "@/lib/client-storage";
import type { Charge, ChargeStatus, Client, Quote } from "@/lib/domain";
import { readQuoteStore } from "@/lib/quote-storage";

type ChargeFormValues = {
  clientId: string;
  quoteId: string;
  amount: string;
  dueDate: string;
  status: ChargeStatus;
};

type SaveState = "idle" | "saved";

const STATUS_OPTIONS: ChargeStatus[] = ["pending", "paid"];

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function formatMoneyInputFromCents(value: number): string {
  return (value / 100).toFixed(2);
}

function parseMoneyInputToCents(value: string): number {
  const cleaned = value.replace(/[^\d.,]/g, "").trim();
  if (cleaned.length === 0) {
    return 0;
  }

  let normalized = cleaned;
  const lastDot = normalized.lastIndexOf(".");
  const lastComma = normalized.lastIndexOf(",");

  if (lastDot >= 0 && lastComma >= 0) {
    if (lastComma > lastDot) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    normalized = normalized.replace(/,/g, ".");
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed * 100);
}

function getClientName(clients: Client[], clientId: string): string {
  return clients.find((client) => client.id === clientId)?.name ?? "Cliente desconhecido";
}

function getChargeStatusLabel(status: "pending" | "paid" | "overdue"): string {
  if (status === "pending") return "Pendente";
  if (status === "paid") return "Pago";
  return "Em atraso";
}

function getDefaultFormValues(clients: Client[]): ChargeFormValues {
  return {
    clientId: clients[0]?.id ?? "",
    quoteId: "",
    amount: "0.00",
    dueDate: getTodayDate(),
    status: "pending",
  };
}

function mapChargeToFormValues(charge: Charge): ChargeFormValues {
  return {
    clientId: charge.clientId,
    quoteId: charge.quoteId ?? "",
    amount: formatMoneyInputFromCents(charge.amountInCents),
    dueDate: charge.dueDate.slice(0, 10),
    status: charge.status,
  };
}

function getClientQuotes(quotes: Quote[], clientId: string): Quote[] {
  return quotes.filter((quote) => quote.clientId === clientId);
}

export function ChargesManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [editingChargeId, setEditingChargeId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ChargeFormValues>(() =>
    getDefaultFormValues([])
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    const storedClients = readClients();
    const storedQuotes = readQuoteStore().quotes;
    const storedCharges = getCharges();

    queueMicrotask(() => {
      setClients(storedClients);
      setQuotes(storedQuotes);
      setCharges(storedCharges);
      setFormValues(getDefaultFormValues(storedClients));
    });
  }, []);

  const hasClients = clients.length > 0;
  const availableQuotes = getClientQuotes(quotes, formValues.clientId);

  function updateField<K extends keyof ChargeFormValues>(
    key: K,
    value: ChargeFormValues[K]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleCreateMode() {
    setEditingChargeId(null);
    setFormValues(getDefaultFormValues(clients));
    setSaveState("idle");
  }

  function handleEdit(charge: Charge) {
    setEditingChargeId(charge.id);
    setFormValues(mapChargeToFormValues(charge));
    setSaveState("idle");
  }

  function handleClientChange(clientId: string) {
    const nextQuotes = getClientQuotes(quotes, clientId);
    const shouldResetQuoteId =
      formValues.quoteId.length > 0 && !nextQuotes.some((quote) => quote.id === formValues.quoteId);

    setFormValues((prev) => ({
      ...prev,
      clientId,
      quoteId: shouldResetQuoteId ? "" : prev.quoteId,
    }));
    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasClients || formValues.clientId.trim().length === 0) {
      return;
    }

    const payload: ChargeInput = {
      clientId: formValues.clientId,
      quoteId: formValues.quoteId.trim().length > 0 ? formValues.quoteId : undefined,
      amountInCents: parseMoneyInputToCents(formValues.amount),
      dueDate: formValues.dueDate,
      status: formValues.status,
    };

    const nextCharges = upsertCharge(payload, editingChargeId ?? undefined);
    setCharges(nextCharges);
    setSaveState("saved");

    if (editingChargeId !== null) {
      const savedCharge = nextCharges.find((charge) => charge.id === editingChargeId);
      if (savedCharge) {
        setFormValues(mapChargeToFormValues(savedCharge));
      }
      return;
    }

    setFormValues(getDefaultFormValues(clients));
  }

  function handleMarkAsPaid(charge: Charge) {
    if (charge.status === "paid") {
      return;
    }

    const nextCharges = upsertCharge(
      {
        clientId: charge.clientId,
        quoteId: charge.quoteId,
        amountInCents: charge.amountInCents,
        dueDate: charge.dueDate,
        status: "paid",
      },
      charge.id
    );

    setCharges(nextCharges);
    if (editingChargeId === charge.id) {
      const savedCharge = nextCharges.find((item) => item.id === charge.id);
      if (savedCharge) {
        setFormValues(mapChargeToFormValues(savedCharge));
      }
    }
  }

  function handleDelete(charge: Charge) {
    const confirmed = window.confirm("Confirmar exclusão desta cobrança?");
    if (!confirmed) {
      return;
    }

    const nextCharges = deleteCharge(charge.id);
    setCharges(nextCharges);

    if (editingChargeId === charge.id) {
      setEditingChargeId(null);
      setFormValues(getDefaultFormValues(clients));
      setSaveState("idle");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Cobranças atuais
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {charges.length === 0
                ? "Nenhuma cobrança salva ainda."
                : `${charges.length} cobrança${charges.length === 1 ? "" : "s"} cadastrada${charges.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          {editingChargeId !== null ? (
            <Button type="button" variant="outline" onClick={handleCreateMode}>
              Criar novo
            </Button>
          ) : null}
        </div>

        {charges.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
            Crie sua primeira cobrança para acompanhar os pagamentos esperados dos clientes.
          </p>
        ) : (
          <ul className="space-y-3">
            {charges.map((charge) => {
              const resolvedStatus = getChargeStatus(charge);
              return (
                <li
                  key={charge.id}
                  data-testid={`charge-item-${charge.id}`}
                  className="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {getClientName(clients, charge.clientId)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatMoneyFromCents(charge.amountInCents)} • {getChargeStatusLabel(resolvedStatus)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Vence em {charge.dueDate.slice(0, 10)}
                        {charge.quoteId ? " • Orçamento vinculado" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {charge.status === "pending" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          data-testid={`charge-mark-paid-${charge.id}`}
                          onClick={() => handleMarkAsPaid(charge)}
                        >
                          Marcar como pago
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid={`charge-edit-${charge.id}`}
                        onClick={() => handleEdit(charge)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid={`charge-delete-${charge.id}`}
                        onClick={() => handleDelete(charge)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {editingChargeId ? "Editar cobrança" : "Criar cobrança"}
        </h2>

        {!hasClients ? (
          <p className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
            Você precisa de pelo menos um cliente antes de criar cobranças.{" "}
            <Link href="/clients" className="underline underline-offset-4 hover:no-underline">
              Abrir clientes
            </Link>
            .
          </p>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="clientId" className="text-sm font-medium">
                  Cliente
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  required
                  value={formValues.clientId}
                  onChange={(event) => handleClientChange(event.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="quoteId" className="text-sm font-medium">
                  Orçamento (opcional)
                </label>
                <select
                  id="quoteId"
                  name="quoteId"
                  value={formValues.quoteId}
                  onChange={(event) => updateField("quoteId", event.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="">Sem orçamento</option>
                  {availableQuotes.map((quote) => (
                    <option key={quote.id} value={quote.id}>
                      {quote.id.slice(0, 8)} • {formatMoneyFromCents(quote.totalInCents)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Valor
                </label>
                <input
                  id="amount"
                  name="amount"
                  required
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formValues.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="dueDate" className="text-sm font-medium">
                  Data de vencimento
                </label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  value={formValues.dueDate}
                  onChange={(event) => updateField("dueDate", event.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formValues.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as ChargeStatus)
                  }
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {getChargeStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit">
                {editingChargeId ? "Salvar alterações" : "Criar cobrança"}
              </Button>
              {editingChargeId ? (
                <Button type="button" variant="outline" onClick={handleCreateMode}>
                  Cancelar edição
                </Button>
              ) : null}
              {saveState === "saved" ? (
                <p className="text-sm text-muted-foreground">Salvo.</p>
              ) : null}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
