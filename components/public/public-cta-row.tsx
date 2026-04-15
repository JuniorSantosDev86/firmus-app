import type { ReactNode } from "react";

type PublicCtaRowProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PublicCtaRow({ title, description, children }: PublicCtaRowProps) {
  return (
    <section className="firmus-public-cta-row print:hidden">
      <div>
        <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
        <p className="text-sm text-[#64748B]">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
    </section>
  );
}
