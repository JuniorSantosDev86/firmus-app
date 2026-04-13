"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getCharges } from "@/lib/charge-storage";
import { readClients } from "@/lib/client-storage";
import type { Charge, Client } from "@/lib/domain";
import type { ReminderWithDerivedState } from "@/lib/services/reminders";
import {
  createReminder,
  getReminderGroups,
  markReminderAsDone,
} from "@/lib/services/reminders";

type ReminderFormValues = {
  title: string;
  description: string;
  dueDate: string;
  clientId: string;
  chargeId: string;
};

const INITIAL_FORM_VALUES: ReminderFormValues = {
  title: "",
  description: "",
  dueDate: "",
  clientId: "",
  chargeId: "",
};

type ReminderSnapshot = {
  pending: ReminderWithDerivedState[];
  done: ReminderWithDerivedState[];
};

const INITIAL_SNAPSHOT: ReminderSnapshot = {
  pending: [],
  done: [],
};

function formatDueDate(value?: string): string {
  if (!value) {
    return "Sem data";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Sem data";
  }

  return parsed.toLocaleDateString("pt-BR");
}

function getClientName(clients: Client[], clientId?: string): string | null {
  if (!clientId) {
    return null;
  }

  const client = clients.find((item) => item.id === clientId);
  return client?.name ?? "Cliente não encontrado";
}

function getChargeLabel(charges: Charge[], chargeId?: string): string | null {
  if (!chargeId) {
    return null;
  }

  const charge = charges.find((item) => item.id === chargeId);
  if (!charge) {
    return "Cobrança não encontrada";
  }

  return `Cobrança ${charge.id.slice(0, 8)}`;
}

function resolveSourceType(formValues: ReminderFormValues): "manual" | "charge" | "client_followup" {
  if (formValues.chargeId.trim().length > 0) {
    return "charge";
  }

  if (formValues.clientId.trim().length > 0) {
    return "client_followup";
  }

  return "manual";
}

function ReminderItem({
  reminder,
  clients,
  charges,
  onComplete,
}: {
  reminder: ReminderWithDerivedState;
  clients: Client[];
  charges: Charge[];
  onComplete?: (id: string) => void;
}) {
  const clientName = getClientName(clients, reminder.clientId);
  const chargeLabel = getChargeLabel(charges, reminder.chargeId);

  return (
    <li
      key={reminder.id}
      data-testid={`reminder-item-${reminder.id}`}
      className="rounded-xl border border-border bg-background px-4 py-3"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-foreground">{reminder.title}</p>
          {reminder.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{reminder.description}</p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            {reminder.isOverdue
              ? "Atrasado"
              : reminder.isDueToday
                ? "Hoje"
                : formatDueDate(reminder.dueDate)}
          </p>
          {clientName ? (
            <p className="mt-1 text-xs text-muted-foreground">Cliente: {clientName}</p>
          ) : null}
          {chargeLabel ? (
            <p className="mt-1 text-xs text-muted-foreground">Cobrança: {chargeLabel}</p>
          ) : null}
        </div>

        {onComplete ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid={`reminder-complete-${reminder.id}`}
            onClick={() => onComplete(reminder.id)}
          >
            Marcar como concluído
          </Button>
        ) : null}
      </div>
    </li>
  );
}

export function RemindersManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [snapshot, setSnapshot] = useState<ReminderSnapshot>(INITIAL_SNAPSHOT);
  const [formValues, setFormValues] = useState<ReminderFormValues>(INITIAL_FORM_VALUES);

  function refreshSnapshot() {
    const groups = getReminderGroups();
    setSnapshot({
      pending: groups.pending,
      done: groups.done,
    });
  }

  useEffect(() => {
    const storedClients = readClients();
    const storedCharges = getCharges();

    queueMicrotask(() => {
      setClients(storedClients);
      setCharges(storedCharges);
      refreshSnapshot();
    });
  }, []);

  function updateField<K extends keyof ReminderFormValues>(
    key: K,
    value: ReminderFormValues[K]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleCreateReminder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = formValues.title.trim();
    if (title.length === 0) {
      return;
    }

    const selectedCharge = charges.find((charge) => charge.id === formValues.chargeId) ?? null;

    createReminder({
      title,
      description: formValues.description,
      dueDate: formValues.dueDate,
      clientId: formValues.clientId || selectedCharge?.clientId,
      chargeId: formValues.chargeId,
      sourceType: resolveSourceType(formValues),
    });

    setFormValues(INITIAL_FORM_VALUES);
    refreshSnapshot();
  }

  function handleMarkAsDone(reminderId: string) {
    const completed = markReminderAsDone(reminderId);
    if (!completed) {
      return;
    }

    refreshSnapshot();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Novo lembrete</h2>

        <form className="mt-5 space-y-4" onSubmit={handleCreateReminder}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <input
                id="title"
                name="title"
                required
                value={formValues.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formValues.description}
                onChange={(event) => updateField("description", event.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="dueDate" className="text-sm font-medium">
                Data
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formValues.dueDate}
                onChange={(event) => updateField("dueDate", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="clientId" className="text-sm font-medium">
                Cliente
              </label>
              <select
                id="clientId"
                name="clientId"
                value={formValues.clientId}
                onChange={(event) => updateField("clientId", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">Sem cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="chargeId" className="text-sm font-medium">
                Cobrança
              </label>
              <select
                id="chargeId"
                name="chargeId"
                value={formValues.chargeId}
                onChange={(event) => updateField("chargeId", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">Sem cobrança</option>
                {charges.map((charge) => (
                  <option key={charge.id} value={charge.id}>
                    {charge.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-1">
            <Button type="submit">Criar lembrete</Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Pendentes</h2>

        {snapshot.pending.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
            Nenhum lembrete pendente.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {snapshot.pending.map((reminder) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                clients={clients}
                charges={charges}
                onComplete={handleMarkAsDone}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Concluídos</h2>

        {snapshot.done.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
            Nenhum lembrete concluído.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {snapshot.done.map((reminder) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                clients={clients}
                charges={charges}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
