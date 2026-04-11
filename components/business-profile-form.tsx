"use client";

import { useState } from "react";

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
  const [profile, setProfile] = useState<BusinessProfile | null>(() =>
    getInitialProfile()
  );
  const [formValues, setFormValues] = useState<BusinessProfileInput>(() => {
    const existingProfile = getInitialProfile();
    return existingProfile
      ? mapProfileToInput(existingProfile)
      : { ...INITIAL_VALUES };
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");

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
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Current profile
          </h2>
          {!hasProfile ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No business profile saved yet.
            </p>
          ) : null}
        </div>

        {hasProfile ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Business name</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.businessName)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Professional name</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.professionalName)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">City</dt>
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
              <dt className="text-muted-foreground">Short description</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.shortDescription)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Logo URL</dt>
              <dd className="mt-1 font-medium text-foreground">
                {displayValue(profile.logoUrl)}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {hasProfile ? "Edit business profile" : "Create business profile"}
        </h2>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label htmlFor="businessName" className="text-sm font-medium">
              Business name
            </label>
            <input
              id="businessName"
              name="businessName"
              required
              value={formValues.businessName}
              onChange={(event) =>
                updateField("businessName", event.target.value)
              }
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="professionalName" className="text-sm font-medium">
              Professional name
            </label>
            <input
              id="professionalName"
              name="professionalName"
              required
              value={formValues.professionalName}
              onChange={(event) =>
                updateField("professionalName", event.target.value)
              }
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="shortDescription" className="text-sm font-medium">
              Short description
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              rows={3}
              value={formValues.shortDescription}
              onChange={(event) =>
                updateField("shortDescription", event.target.value)
              }
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="logoUrl" className="text-sm font-medium">
              Logo URL (placeholder)
            </label>
            <input
              id="logoUrl"
              name="logoUrl"
              value={formValues.logoUrl}
              onChange={(event) => updateField("logoUrl", event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">Save profile</Button>
            {saveState === "saved" ? (
              <p className="text-sm text-muted-foreground">Saved.</p>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
