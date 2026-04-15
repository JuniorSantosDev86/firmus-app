"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Client } from "@/lib/domain";
import {
  deleteClient,
  readClients,
  upsertClient,
  type ClientInput,
} from "@/lib/client-storage";

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
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ClientInput>({ ...INITIAL_VALUES });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    const initialClients = getInitialClients();
    queueMicrotask(() => {
      setClients(initialClients);
    });
  }, []);

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
    setDeleteMessage(null);
  }

  function handleEdit(client: Client) {
    setEditingClientId(client.id);
    setFormValues(mapClientToInput(client));
    setSaveState("idle");
    setDeleteMessage(null);
  }

  function handleDelete(client: Client) {
    const confirmed = window.confirm("Confirmar exclusão deste cliente?");
    if (!confirmed) {
      return;
    }

    const result = deleteClient(client.id);
    setClients(result.clients);

    if (!result.ok) {
      setDeleteMessage(
        "Este cliente não pode ser excluído porque possui orçamentos ou cobranças vinculados."
      );
      return;
    }

    if (editingClientId === client.id) {
      setEditingClientId(null);
      setFormValues({ ...INITIAL_VALUES });
    }
    setDeleteMessage("Cliente excluído.");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    if (name.length === 0) {
      return;
    }

    const nextClients = upsertClient(
      { ...formValues, name },
      editingClientId ?? undefined
    );
    setClients(nextClients);
    setSaveState("saved");
    setDeleteMessage(null);

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
      <section className="firmus-panel">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Clientes atuais
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {clients.length === 0
                ? "Nenhum cliente salvo ainda."
                : `${clients.length} cliente${clients.length === 1 ? "" : "s"} cadastrado${clients.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          {editingClientId !== null ? (
            <Button type="button" variant="outline" onClick={handleCreateMode}>
              Criar novo
            </Button>
          ) : null}
        </div>

        {clients.length === 0 ? (
          <p className="firmus-empty-state">
            Adicione seu primeiro cliente para começar a criar orçamentos e acompanhar atendimentos.
          </p>
        ) : (
          <ul className="space-y-3">
            {clients.map((client) => (
              <li
                key={client.id}
                data-testid={`client-item-${client.id}`}
                className="firmus-list-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {displayValue(client.city)} • {displayValue(client.whatsapp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex h-7 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-[0.8rem] font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC]"
                    >
                      Ver
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid={`client-edit-${client.id}`}
                      onClick={() => handleEdit(client)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid={`client-delete-${client.id}`}
                      onClick={() => handleDelete(client)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {deleteMessage ? (
          <p className="mt-4 text-sm text-muted-foreground">{deleteMessage}</p>
        ) : null}
      </section>

      <section className="firmus-panel">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {selectedClient ? "Editar cliente" : "Criar cliente"}
        </h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="name"
              name="name"
              required
              value={formValues.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="firmus-input"
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
                className="firmus-input"
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
                className="firmus-input"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="city" className="text-sm font-medium">
              Cidade
            </label>
            <input
              id="city"
              name="city"
              value={formValues.city}
              onChange={(event) => updateField("city", event.target.value)}
              className="firmus-input"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formValues.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              className="firmus-textarea"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">
              {selectedClient ? "Salvar alterações" : "Criar cliente"}
            </Button>
            {selectedClient ? (
              <Button type="button" variant="outline" onClick={handleCreateMode}>
                Cancelar edição
              </Button>
            ) : null}
            {saveState === "saved" ? (
              <p className="text-sm text-muted-foreground">Salvo.</p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
