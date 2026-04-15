"use client";

import { useEffect, useState } from "react";

import { PublicStatusCard } from "@/components/public/public-status-card";
import { PublicSurfaceShell } from "@/components/public/public-surface-shell";
import {
  getPublicBioSnapshot,
  type PublicBioSnapshot,
} from "@/lib/services/public-bio-presenter";

function getInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .slice(0, 2);

  if (parts.length === 0) {
    return "FP";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function BioIdentity({ snapshot }: { snapshot: PublicBioSnapshot }) {
  const brandInitials = getInitials(snapshot.businessName);

  return (
    <section className="firmus-public-card space-y-4 p-7">
      <div className="space-y-1">
        <p className="firmus-public-eyebrow">Perfil público</p>
        <p className="text-sm text-[#64748B]">Apresentação profissional para compartilhamento com clientes.</p>
      </div>
      <div className="flex items-start gap-4">
        {snapshot.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={snapshot.logoUrl}
            alt={`Logo de ${snapshot.businessName}`}
            className="h-14 w-14 rounded-xl border border-[#D9E3EE] bg-white object-cover"
            loading="lazy"
          />
        ) : (
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-[#BEE5E3] bg-[#EAF8F7] text-sm font-semibold text-[#0F766E]">
            {brandInitials}
          </div>
        )}

        <div className="min-w-0 space-y-1">
          <h1 className="firmus-public-title">{snapshot.businessName}</h1>
          {snapshot.professionalName ? (
            <p className="text-sm font-medium text-[#334155]">{snapshot.professionalName}</p>
          ) : null}
          {snapshot.city ? <p className="text-sm text-[#64748B]">{snapshot.city}</p> : null}
        </div>
      </div>

      {snapshot.shortDescription ? (
        <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FBFF] px-4 py-3 text-sm leading-relaxed text-[#334155]">
          {snapshot.shortDescription}
        </p>
      ) : null}
    </section>
  );
}

function BioContact({ snapshot }: { snapshot: PublicBioSnapshot }) {
  return (
    <section className="firmus-public-card space-y-3 p-6">
      <h2 className="firmus-public-section-title">Contato profissional</h2>

      {snapshot.whatsapp ? (
        <div className="space-y-3">
          <p className="text-sm text-[#334155]">
            WhatsApp: <span className="font-medium text-[#0F172A]">{snapshot.whatsapp}</span>
          </p>
          {snapshot.primaryCta ? (
            <a
              href={snapshot.primaryCta.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-lg bg-[#0F766E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0D6C65]"
            >
              {snapshot.primaryCta.label}
            </a>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-[#64748B]">Contato ainda não informado.</p>
      )}
    </section>
  );
}

export function PublicBioPage() {
  const [snapshot, setSnapshot] = useState<PublicBioSnapshot | null | undefined>(undefined);

  useEffect(() => {
    const next = getPublicBioSnapshot();
    queueMicrotask(() => {
      setSnapshot(next);
    });
  }, []);

  if (snapshot === undefined) {
    return (
      <PublicSurfaceShell width="bio" testId="public-bio-loading">
        <PublicStatusCard description="Carregando página pública..." />
      </PublicSurfaceShell>
    );
  }

  if (snapshot === null) {
    return (
      <PublicSurfaceShell width="bio" testId="public-bio-not-ready">
        <PublicStatusCard
          title="Perfil público indisponível"
          description="Configure o Perfil da empresa para publicar esta página."
        />
      </PublicSurfaceShell>
    );
  }

  return (
    <PublicSurfaceShell width="bio" className="firmus-public-stack" testId="public-bio-page">
      <BioIdentity snapshot={snapshot} />
      <BioContact snapshot={snapshot} />
    </PublicSurfaceShell>
  );
}
