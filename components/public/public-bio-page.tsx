"use client";

import { useEffect, useState } from "react";

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
    <section className="space-y-4 rounded-[24px] border border-[#D9E3EE] bg-white p-7 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.44)]">
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
          <h1 className="text-[30px] leading-tight font-semibold tracking-tight text-[#0F172A]">
            {snapshot.businessName}
          </h1>
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
    <section className="space-y-3 rounded-[20px] border border-[#D9E3EE] bg-white p-6">
      <h2 className="text-sm font-semibold tracking-[0.12em] text-[#64748B] uppercase">
        Contato profissional
      </h2>

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
      <main className="mx-auto w-full max-w-[760px] px-4 py-8" data-testid="public-bio-loading">
        <section className="rounded-2xl border border-[#D9E3EE] bg-white p-6">
          <p className="text-sm text-[#64748B]">Carregando página pública...</p>
        </section>
      </main>
    );
  }

  if (snapshot === null) {
    return (
      <main className="mx-auto w-full max-w-[760px] px-4 py-8" data-testid="public-bio-not-ready">
        <section className="rounded-2xl border border-[#D9E3EE] bg-white p-6">
          <h1 className="text-xl font-semibold text-[#0F172A]">Perfil público indisponível</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Configure o Perfil da empresa para publicar esta página.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[760px] space-y-5 px-4 py-8" data-testid="public-bio-page">
      <BioIdentity snapshot={snapshot} />
      <BioContact snapshot={snapshot} />
    </main>
  );
}
