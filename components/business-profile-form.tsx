"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { BusinessProfile } from "@/lib/domain";
import {
  readBusinessProfile,
  writeBusinessProfile,
  type BusinessProfileInput,
} from "@/lib/business-profile-storage";

const INITIAL_VALUES: BusinessProfileInput = {
  businessName: "",
  professionalName: "",
  shortDescription: "",
  city: "",
  whatsapp: "",
  logoUrl: "",
};

type SaveState = "idle" | "saved";

function getInitialProfile(): BusinessProfile | null {
  return readBusinessProfile();
}

function mapProfileToInput(profile: BusinessProfile): BusinessProfileInput {
  return {
    businessName: profile.businessName,
    professionalName: profile.professionalName,
    shortDescription: profile.shortDescription ?? "",
    city: profile.city ?? "",
    whatsapp: profile.whatsapp ?? "",
    logoUrl: profile.logoUrl ?? "",
  };
}

function displayValue(value: string | null): string {
  return value && value.length > 0 ? value : "—";
}

export function BusinessProfileForm() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [formValues, setFormValues] = useState<BusinessProfileInput>({
    ...INITIAL_VALUES,
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    const existingProfile = getInitialProfile();
    if (!existingProfile) {
      return;
    }

    queueMicrotask(() => {
      setProfile(existingProfile);
      setFormValues(mapProfileToInput(existingProfile));
    });
  }, []);

  const hasProfile = profile !== null;

  function updateField<K extends keyof BusinessProfileInput>(
    key: K,
    value: BusinessProfileInput[K]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (saveState === "saved") {
      setSaveState("idle");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const businessName = formValues.businessName.trim();
    const professionalName = formValues.professionalName.trim();
    if (businessName.length === 0 || professionalName.length === 0) {
      return;
    }

    const next = writeBusinessProfile({
      ...formValues,
      businessName,
      professionalName,
    });
    setProfile(next);
    setFormValues(mapProfileToInput(next));
    setSaveState("saved");
  }

  return (
    <div className="space-y-6">
      <section className="firmus-panel">
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Perfil atual
          </h2>
          {!hasProfile ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum perfil da empresa salvo ainda.
            </p>
          ) : null}
        </div>

        {hasProfile ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Nome da empresa</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.businessName)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Nome profissional</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.professionalName)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cidade</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.city)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">WhatsApp</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.whatsapp)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Descrição curta</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.shortDescription)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">URL do logo</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.logoUrl)}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="firmus-panel">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {hasProfile ? "Editar perfil da empresa" : "Criar perfil da empresa"}
        </h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="businessName" className="text-sm font-medium">
              Nome da empresa
            </label>
            <input
              id="businessName"
              name="businessName"
              required
              value={formValues.businessName}
              onChange={(event) =>
                updateField("businessName", event.target.value)
              }
              className="firmus-input"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="professionalName" className="text-sm font-medium">
              Nome profissional
            </label>
            <input
              id="professionalName"
              name="professionalName"
              required
              value={formValues.professionalName}
              onChange={(event) =>
                updateField("professionalName", event.target.value)
              }
              className="firmus-input"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="shortDescription" className="text-sm font-medium">
              Descrição curta
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              rows={3}
              value={formValues.shortDescription}
              onChange={(event) =>
                updateField("shortDescription", event.target.value)
              }
              className="firmus-textarea"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
              <label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                value={formValues.whatsapp}
                onChange={(event) =>
                  updateField("whatsapp", event.target.value)
                }
                className="firmus-input"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="logoUrl" className="text-sm font-medium">
              URL do logo (temporário)
            </label>
            <input
              id="logoUrl"
              name="logoUrl"
              value={formValues.logoUrl}
              onChange={(event) => updateField("logoUrl", event.target.value)}
              className="firmus-input"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">Salvar perfil</Button>
            {saveState === "saved" ? (
              <p className="text-sm text-muted-foreground">Salvo.</p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
