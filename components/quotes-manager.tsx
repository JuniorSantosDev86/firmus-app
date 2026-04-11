"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { readClients } from "@/lib/client-storage";
import type { Client, Quote, QuoteItem, QuoteStatus, Service } from "@/lib/domain";
import {
  calculateLineTotalInCents,
  calculateQuoteTotals,
  parseMoneyInputToCents,
  parseQuantityInput,
  readQuoteStore,
  upsertQuote,
} from "@/lib/quote-storage";
import { readServices } from "@/lib/service-storage";

type EditableQuoteItem = {
  id?: string;
  serviceId: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

type QuoteFormValues = {
  clientId: string;
  status: QuoteStatus;
  issueDate: string;
  validUntil: string;
  discount: string;
  items: EditableQuoteItem[];
};

type SaveState = "idle" | "saved";

const STATUS_OPTIONS: QuoteStatus[] = [
  "draft",
  "sent",
  "approved",
  "rejected",
  "expired",
  "canceled",
];

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMoneyFromCents(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
}

function formatMoneyInputFromCents(value: number): string {
  return (value / 100).toFixed(2);
}

function formatQuantityForInput(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(value);
}

function getDefaultItem(): EditableQuoteItem {
  return {
    serviceId: "",
    description: "",
    quantity: "1",
    unitPrice: "0.00",
  };
}

function getInitialFormValues(clients: Client[]): QuoteFormValues {
  return {
    clientId: clients[0]?.id ?? "",
    status: "draft",
    issueDate: getTodayDate(),
    validUntil: "",
    discount: "0.00",
    items: [getDefaultItem()],
  };
}

function mapQuoteToFormValues(
  quote: Quote,
  quoteItems: QuoteItem[]
): QuoteFormValues {
  const itemLookup = new Map(quoteItems.map((item) => [item.id, item]));
  const itemsFromQuote = quote.itemIds
    .map((itemId) => itemLookup.get(itemId))
    .filter((item): item is QuoteItem => item !== undefined)
    .map((item) => ({
      id: item.id,
      serviceId: item.serviceId ?? "",
      description: item.description,
      quantity: formatQuantityForInput(item.quantity),
      unitPrice: formatMoneyInputFromCents(item.unitPriceInCents),
    }));

  return {
    clientId: quote.clientId,
    status: quote.status,
    issueDate: quote.issueDate,
    validUntil: quote.validUntil ?? "",
    discount: formatMoneyInputFromCents(quote.discountInCents),
    items: itemsFromQuote.length > 0 ? itemsFromQuote : [getDefaultItem()],
  };
}

function getClientName(clients: Client[], clientId: string): string {
  return clients.find((client) => client.id === clientId)?.name ?? "Unknown client";
}

function getQuoteItems(quote: Quote, items: QuoteItem[]): QuoteItem[] {
  const itemLookup = new Map(items.map((item) => [item.id, item]));
  return quote.itemIds
    .map((itemId) => itemLookup.get(itemId))
    .filter((item): item is QuoteItem => item !== undefined);
}

export function QuotesManager() {
  const [clients] = useState<Client[]>(() => readClients());
  const [services] = useState<Service[]>(() => readServices());
  const [store, setStore] = useState(() => readQuoteStore());
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [formValues, setFormValues] = useState<QuoteFormValues>(() =>
    getInitialFormValues(readClients())
  );

  const hasClients = clients.length > 0;

  const preparedItems = useMemo(
    () =>
      formValues.items.map((item) => {
        const quantity = parseQuantityInput(item.quantity);
        const unitPriceInCents = parseMoneyInputToCents(item.unitPrice);
        const lineTotalInCents = calculateLineTotalInCents(quantity, unitPriceInCents);

        return {
          ...item,
          quantityNumber: quantity,
          unitPriceInCents,
          lineTotalInCents,
        };
      }),
    [formValues.items]
  );

  const totals = useMemo(() => {
    const discountInCents = parseMoneyInputToCents(formValues.discount);
    return calculateQuoteTotals(
      preparedItems.map((item) => item.lineTotalInCents),
      discountInCents
    );
  }, [formValues.discount, preparedItems]);

  function handleCreateMode() {
    setEditingQuoteId(null);
    setSaveState("idle");
    setFormValues(getInitialFormValues(clients));
  }

  function handleEdit(quote: Quote) {
    setEditingQuoteId(quote.id);
    setSaveState("idle");
    setFormValues(mapQuoteToFormValues(quote, getQuoteItems(quote, store.items)));
  }

  function updateField<K extends keyof QuoteFormValues>(
    key: K,
    value: QuoteFormValues[K]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function updateItemField<K extends keyof EditableQuoteItem>(
    index: number,
    key: K,
    value: EditableQuoteItem[K]
  ) {
    setFormValues((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));

    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleServiceSelection(index: number, serviceId: string) {
    const selectedService = services.find((service) => service.id === serviceId) ?? null;

    setFormValues((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (!selectedService) {
          return { ...item, serviceId: "" };
        }

        return {
          ...item,
          serviceId: selectedService.id,
          description: selectedService.description ?? selectedService.name,
          unitPrice: formatMoneyInputFromCents(selectedService.basePriceInCents),
        };
      }),
    }));

    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleAddItem() {
    setFormValues((prev) => ({
      ...prev,
      items: [...prev.items, getDefaultItem()],
    }));

    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleRemoveItem(index: number) {
    setFormValues((prev) => {
      if (prev.items.length <= 1) {
        return prev;
      }

      return {
        ...prev,
        items: prev.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });

    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasClients || formValues.clientId.trim().length === 0) {
      return;
    }

    const validItems = preparedItems
      .map((item) => ({
        id: item.id,
        serviceId: item.serviceId.length > 0 ? item.serviceId : null,
        description: item.description.trim(),
        quantity: item.quantityNumber,
        unitPriceInCents: item.unitPriceInCents,
      }))
      .filter((item) => item.description.length > 0 && item.quantity > 0);

    if (validItems.length === 0) {
      return;
    }

    const nextStore = upsertQuote(
      {
        clientId: formValues.clientId,
        status: formValues.status,
        issueDate: formValues.issueDate,
        validUntil: formValues.validUntil.trim().length > 0 ? formValues.validUntil : null,
        discountInCents: parseMoneyInputToCents(formValues.discount),
        items: validItems,
      },
      editingQuoteId ?? undefined
    );

    setStore(nextStore);
    setSaveState("saved");

    if (editingQuoteId !== null) {
      const savedQuote = nextStore.quotes.find((quote) => quote.id === editingQuoteId);
      if (savedQuote) {
        setFormValues(
          mapQuoteToFormValues(
            savedQuote,
            getQuoteItems(savedQuote, nextStore.items)
          )
        );
      }
      return;
    }

    setFormValues(getInitialFormValues(clients));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Current quotes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {store.quotes.length === 0
                ? "No quotes saved yet."
                : `${store.quotes.length} quote${store.quotes.length === 1 ? "" : "s"} registered.`}
            </p>
          </div>
          {editingQuoteId !== null ? (
            <Button type="button" variant="outline" onClick={handleCreateMode}>
              Create new
            </Button>
          ) : null}
        </div>

        {store.quotes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
            Create your first quote to connect clients, services, and pricing in one flow.
          </p>
        ) : (
          <ul className="space-y-3">
            {store.quotes.map((quote) => {
              const quoteItems = getQuoteItems(quote, store.items);
              return (
                <li
                  key={quote.id}
                  className="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {getClientName(clients, quote.clientId)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatMoneyFromCents(quote.totalInCents)} • {quote.status} • {" "}
                        {quoteItems.length} item{quoteItems.length === 1 ? "" : "s"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Issue date {quote.issueDate}
                        {quote.validUntil ? ` • Valid until ${quote.validUntil}` : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(quote)}
                    >
                      Edit
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {editingQuoteId ? "Edit quote" : "Create quote"}
        </h2>

        {!hasClients ? (
          <p className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
            You need at least one client before creating quotes. {" "}
            <Link href="/clients" className="underline underline-offset-4 hover:no-underline">
              Open clients
            </Link>
            .
          </p>
        ) : (
          <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="clientId" className="text-sm font-medium">
                  Client
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  required
                  value={formValues.clientId}
                  onChange={(event) => updateField("clientId", event.target.value)}
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
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formValues.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as QuoteStatus)
                  }
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="issueDate" className="text-sm font-medium">
                  Issue date
                </label>
                <input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  required
                  value={formValues.issueDate}
                  onChange={(event) => updateField("issueDate", event.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="validUntil" className="text-sm font-medium">
                  Valid until (optional)
                </label>
                <input
                  id="validUntil"
                  name="validUntil"
                  type="date"
                  value={formValues.validUntil}
                  onChange={(event) => updateField("validUntil", event.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">Quote items</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  Add item
                </Button>
              </div>

              {services.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  No services available yet. You can still enter item description and price manually.
                </p>
              ) : null}

              <div className="space-y-3">
                {preparedItems.map((item, index) => (
                  <div
                    key={item.id ?? `new-item-${index}`}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Service (optional)
                        </label>
                        <select
                          value={item.serviceId}
                          onChange={(event) =>
                            handleServiceSelection(index, event.target.value)
                          }
                          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <option value="">Manual item</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid gap-2 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Description
                        </label>
                        <input
                          required
                          value={item.description}
                          onChange={(event) =>
                            updateItemField(index, "description", event.target.value)
                          }
                          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Quantity
                        </label>
                        <input
                          required
                          inputMode="decimal"
                          placeholder="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItemField(index, "quantity", event.target.value)
                          }
                          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Unit price
                        </label>
                        <input
                          required
                          inputMode="decimal"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(event) =>
                            updateItemField(index, "unitPrice", event.target.value)
                          }
                          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Line total: {formatMoneyFromCents(item.lineTotalInCents)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        disabled={preparedItems.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="grid gap-2">
                  <label htmlFor="discount" className="text-sm font-medium">
                    Discount
                  </label>
                  <input
                    id="discount"
                    name="discount"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={formValues.discount}
                    onChange={(event) => updateField("discount", event.target.value)}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>

                <dl className="space-y-1 text-sm text-foreground sm:text-right">
                  <div>
                    <dt className="inline text-muted-foreground">Subtotal: </dt>
                    <dd className="inline font-medium">
                      {formatMoneyFromCents(totals.subtotalInCents)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Discount: </dt>
                    <dd className="inline font-medium">
                      {formatMoneyFromCents(totals.discountInCents)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">Total: </dt>
                    <dd className="inline font-semibold">
                      {formatMoneyFromCents(totals.totalInCents)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit">
                {editingQuoteId ? "Save changes" : "Create quote"}
              </Button>
              {editingQuoteId ? (
                <Button type="button" variant="outline" onClick={handleCreateMode}>
                  Cancel edit
                </Button>
              ) : null}
              {saveState === "saved" ? (
                <p className="text-sm text-muted-foreground">Saved.</p>
              ) : null}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
