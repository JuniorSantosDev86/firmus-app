"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Client } from "@/lib/domain";
import { readClients, upsertClient, type ClientInput } from "@/lib/client-storage";

const INITIAL_VALUES: ClientInput = {
  name: "",
  whatsapp: "",
  email: "",
  city: "",
  notes: "",
};

type SaveState = "idle" | "saved";

function getInitialClients(): Client[] {
  return readClients();
}

function mapClientToInput(client: Client): ClientInput {
  return {
    name: client.name,
    whatsapp: client.whatsapp ?? "",
    email: client.email ?? "",
    city: client.city ?? "",
    notes: client.notes ?? "",
  };
}

function displayValue(value: string | null): string {
  return value && value.length > 0 ? value : "—";
}

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>(() => getInitialClients());
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ClientInput>({ ...INITIAL_VALUES });
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const selectedClient =
    editingClientId === null
      ? null
      : clients.find((client) => client.id === editingClientId) ?? null;

  function updateField<K extends keyof ClientInput>(
    key: K,
    value: ClientInput[K]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleCreateMode() {
    setEditingClientId(null);
    setFormValues({ ...INITIAL_VALUES });
    setSaveState("idle");
  }

  function handleEdit(client: Client) {
    setEditingClientId(client.id);
    setFormValues(mapClientToInput(client));
    setSaveState("idle");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextClients = upsertClient(formValues, editingClientId ?? undefined);
    setClients(nextClients);
    setSaveState("saved");

    if (editingClientId !== null) {
      const savedClient = nextClients.find((client) => client.id === editingClientId);
      if (savedClient) {
        setFormValues(mapClientToInput(savedClient));
      }
      return;
    }

    setFormValues({ ...INITIAL_VALUES });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Current clients
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {clients.length === 0
                ? "No clients saved yet."
                : `${clients.length} client${clients.length === 1 ? "" : "s"} registered.`}
            </p>
          </div>
          {editingClientId !== null ? (
            <Button type="button" variant="outline" onClick={handleCreateMode}>
              Create new
            </Button>
          ) : null}
        </div>

        {clients.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
            Add your first client to start building quotes and follow-ups.
          </p>
        ) : (
          <ul className="space-y-3">
            {clients.map((client) => (
              <li
                key={client.id}
                className="rounded-xl border border-border bg-background px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {displayValue(client.city)} • {displayValue(client.whatsapp)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(client)}
                  >
                    Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {selectedClient ? "Edit client" : "Create client"}
        </h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              pattern=".*\\S.*"
              title="Name cannot be empty."
              value={formValues.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                value={formValues.whatsapp}
                onChange={(event) => updateField("whatsapp", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <input
              id="city"
              name="city"
              value={formValues.city}
              onChange={(event) => updateField("city", event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formValues.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">
              {selectedClient ? "Save changes" : "Create client"}
            </Button>
            {selectedClient ? (
              <Button type="button" variant="outline" onClick={handleCreateMode}>
                Cancel edit
              </Button>
            ) : null}
            {saveState === "saved" ? (
              <p className="text-sm text-muted-foreground">Saved.</p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
