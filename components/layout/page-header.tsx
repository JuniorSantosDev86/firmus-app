import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  contextLabel?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  contextLabel = "Gestão interna",
}: PageHeaderProps) {
  return (
    <header className="space-y-4 border-b border-[#DCE5EF] pb-6">
      {actions ? <div className="pt-0.5">{actions}</div> : null}
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.12em] text-[#64748B] uppercase">{contextLabel}</p>
        <h1 className="text-[32px] leading-[1.12] font-semibold tracking-tight text-[#0F172A]">{title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[#64748B]">{description}</p>
      </div>
    </header>
  );
}
