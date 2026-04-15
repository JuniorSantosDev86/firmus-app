import { cn } from "@/lib/utils";

type PublicStatusCardProps = {
  title?: string;
  description: string;
  className?: string;
  testId?: string;
};

export function PublicStatusCard({ title, description, className, testId }: PublicStatusCardProps) {
  return (
    <section className={cn("firmus-public-status-card", className)} data-testid={testId}>
      {title ? <h1 className="text-xl font-semibold text-[#0F172A]">{title}</h1> : null}
      <p className={cn("text-sm text-[#64748B]", title && "mt-2")}>{description}</p>
    </section>
  );
}
