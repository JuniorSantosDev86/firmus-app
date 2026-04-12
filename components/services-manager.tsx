"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/domain";
import {
  readServices,
  upsertService,
  type ServiceInput,
} from "@/lib/service-storage";

const INITIAL_VALUES: ServiceInput = {
  name: "",
  description: "",
  basePrice: "",
  estimatedDeliveryDays: "",
  isActive: true,
};

type SaveState = "idle" | "saved";

function getInitialServices(): Service[] {
  return readServices();
}

function formatPriceFromCents(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function mapServiceToInput(service: Service): ServiceInput {
  return {
    name: service.name,
    description: service.description ?? "",
    basePrice: (service.basePriceInCents / 100).toFixed(2),
    estimatedDeliveryDays:
      service.estimatedDeliveryDays === null
        ? ""
        : String(service.estimatedDeliveryDays),
    isActive: service.isActive,
  };
}

function displayDeliveryDays(value: number | null): string {
  if (value === null) {
    return "No estimate";
  }

  return `${value} day${value === 1 ? "" : "s"}`;
}

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ServiceInput>({ ...INITIAL_VALUES });
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    const initialServices = getInitialServices();
    queueMicrotask(() => {
      setServices(initialServices);
    });
  }, []);

  const selectedService =
    editingServiceId === null
      ? null
      : services.find((service) => service.id === editingServiceId) ?? null;

  function updateField<K extends keyof ServiceInput>(
    key: K,
    value: ServiceInput[K]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleCreateMode() {
    setEditingServiceId(null);
    setFormValues({ ...INITIAL_VALUES });
    setSaveState("idle");
  }

  function handleEdit(service: Service) {
    setEditingServiceId(service.id);
    setFormValues(mapServiceToInput(service));
    setSaveState("idle");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    if (name.length === 0) {
      return;
    }

    const nextServices = upsertService(
      { ...formValues, name },
      editingServiceId ?? undefined
    );
    setServices(nextServices);
    setSaveState("saved");

    if (editingServiceId !== null) {
      const savedService = nextServices.find(
        (service) => service.id === editingServiceId
      );
      if (savedService) {
        setFormValues(mapServiceToInput(savedService));
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
              Current services
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {services.length === 0
                ? "No services saved yet."
                : `${services.length} service${services.length === 1 ? "" : "s"} registered.`}
            </p>
          </div>
          {editingServiceId !== null ? (
            <Button type="button" variant="outline" onClick={handleCreateMode}>
              Create new
            </Button>
          ) : null}
        </div>

        {services.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
            Add your first service to build quotes with a clear and reusable base.
          </p>
        ) : (
          <ul className="space-y-3">
            {services.map((service) => (
              <li
                key={service.id}
                className="rounded-xl border border-border bg-background px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Base price {formatPriceFromCents(service.basePriceInCents)} • {" "}
                      {displayDeliveryDays(service.estimatedDeliveryDays)} • {" "}
                      {service.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
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
          {selectedService ? "Edit service" : "Create service"}
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
              value={formValues.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="basePrice" className="text-sm font-medium">
                Base price
              </label>
              <input
                id="basePrice"
                name="basePrice"
                required
                inputMode="decimal"
                placeholder="0.00"
                value={formValues.basePrice}
                onChange={(event) => updateField("basePrice", event.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="estimatedDeliveryDays" className="text-sm font-medium">
                Estimated delivery (days)
              </label>
              <input
                id="estimatedDeliveryDays"
                name="estimatedDeliveryDays"
                type="number"
                min={0}
                step={1}
                placeholder="Optional"
                value={formValues.estimatedDeliveryDays}
                onChange={(event) =>
                  updateField("estimatedDeliveryDays", event.target.value)
                }
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={formValues.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
              className="size-4 rounded border border-input"
            />
            Service is active
          </label>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">
              {selectedService ? "Save changes" : "Create service"}
            </Button>
            {selectedService ? (
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
