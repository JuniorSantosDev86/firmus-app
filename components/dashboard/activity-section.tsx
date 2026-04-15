import type { TimelineEvent } from "@/lib/domain/timeline-event";

const eventTypeLabel: Record<string, string> = {
  client_created: "Cliente criado",
  service_created: "Serviço criado",
  quote_created: "Orçamento criado",
  charge_created: "Cobrança criada",
  charge_paid: "Cobrança marcada como paga",
  reminder_created: "Lembrete criado",
  reminder_completed: "Lembrete concluído",
};

const entityTypeLabel: Record<TimelineEvent["entityType"], string> = {
  client: "Cliente",
  service: "Serviço",
  quote: "Orçamento",
  charge: "Cobrança",
  reminder: "Lembrete",
};

function formatEventTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

type ActivitySectionProps = {
  events: TimelineEvent[];
};

export function ActivitySection({ events }: ActivitySectionProps) {
  return (
    <section className="space-y-5" data-testid="dashboard-activity-section">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-semibold tracking-tight text-[#0F172A]">Atividades recentes</h2>
        <p className="text-sm text-[#64748B]">Últimos movimentos registrados no workspace</p>
      </header>

      {events.length > 0 ? (
        <div className="rounded-[20px] border border-[#D9E3EE] bg-white shadow-[0_20px_46px_-34px_rgba(15,23,42,0.45)]">
          <ul className="divide-y divide-[#E2E8F0]">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                data-testid={`dashboard-activity-item-${event.id}`}
              >
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    {eventTypeLabel[event.type] ?? "Atualização registrada"}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    Entidade: {entityTypeLabel[event.entityType] ?? "Registro"}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#475569]">
                  {formatEventTimestamp(event.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-[20px] border border-[#D9E3EE] bg-white px-6 py-8 text-center shadow-[0_20px_46px_-34px_rgba(15,23,42,0.45)]">
          <h3 className="text-lg font-semibold text-[#0F172A]">Sua linha do tempo vai aparecer aqui</h3>
          <p className="mt-2 text-sm text-[#64748B]">
            Crie clientes, serviços ou orçamentos para começar a acompanhar as atividades recentes.
          </p>
        </div>
      )}
    </section>
  );
}
