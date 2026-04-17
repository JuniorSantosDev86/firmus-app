import Link from "next/link";

import {
  ACTIVITY_LOG_CATEGORY_FILTER_OPTIONS,
  formatActivityLogTimestamp,
  getActivityLogCategoryLabel,
  getActivityLogStatusLabel,
  type ActivityLogCategoryFilter,
  type ActivityLogEntry,
  type ActivityLogStatus,
} from "@/lib/domain/activity-log";

type ActivityLogsViewProps = {
  entries: ActivityLogEntry[];
  totalMatched: number;
  hasMore: boolean;
  category: ActivityLogCategoryFilter;
  query: string;
  limit: number;
};

function getStatusChipClassName(status: ActivityLogStatus): string {
  if (status === "sucesso") {
    return "firmus-chip-success";
  }

  if (status === "falha") {
    return "firmus-chip-warning";
  }

  return "firmus-chip-info";
}

function buildRouteWithParams(params: {
  category?: ActivityLogCategoryFilter;
  query?: string;
  limit?: number;
}): string {
  const search = new URLSearchParams();

  if (params.category && params.category !== "todos") {
    search.set("category", params.category);
  }

  if (params.query && params.query.trim().length > 0) {
    search.set("q", params.query.trim());
  }

  if (typeof params.limit === "number") {
    search.set("limit", String(params.limit));
  }

  const queryString = search.toString();
  if (queryString.length === 0) {
    return "/activity-logs";
  }

  return `/activity-logs?${queryString}`;
}

export function ActivityLogsView({
  entries,
  totalMatched,
  hasMore,
  category,
  query,
  limit,
}: ActivityLogsViewProps) {
  const loadMoreHref = buildRouteWithParams({
    category,
    query,
    limit: Math.min(200, limit + 40),
  });

  return (
    <div className="space-y-5">
      <section className="firmus-panel space-y-4" data-testid="activity-logs-filters">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-[#0F172A]">Filtros</h2>
          <p className="text-sm text-[#64748B]">Aplique categoria e busca textual simples para inspecionar o histórico.</p>
        </div>

        <form method="GET" action="/activity-logs" className="grid gap-3 md:grid-cols-[220px_1fr_auto_auto]">
          <label className="grid gap-1.5 text-sm text-[#334155]">
            Categoria
            <select
              name="category"
              defaultValue={category}
              className="firmus-input"
              data-testid="activity-logs-category-filter"
            >
              {ACTIVITY_LOG_CATEGORY_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {getActivityLogCategoryLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm text-[#334155]">
            Busca
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Ex.: login, rota, revisão"
              className="firmus-input"
              data-testid="activity-logs-search-input"
            />
          </label>

          <input type="hidden" name="limit" value={String(limit)} />

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0F766E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0D6C65]"
            data-testid="activity-logs-search-submit"
          >
            Aplicar
          </button>

          <Link
            href="/activity-logs"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-4 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC]"
            data-testid="activity-logs-clear-filters"
          >
            Limpar
          </Link>
        </form>
      </section>

      <section className="firmus-panel space-y-4" data-testid="activity-logs-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-[#0F172A]">Trilha recente</h2>
          <p className="text-sm text-[#64748B]" data-testid="activity-logs-count">
            {totalMatched} evento(s) encontrado(s)
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="firmus-empty-state" data-testid="activity-logs-empty-state">
            Nenhum evento corresponde aos filtros atuais.
          </div>
        ) : (
          <ul className="space-y-3" data-testid="activity-logs-feed">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="firmus-list-card space-y-2.5"
                data-testid="activity-log-item"
                data-occurred-at={entry.occurredAt}
                data-category={entry.category}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full border border-[#D1FAE5] bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#047857]" data-testid="activity-log-category-badge">
                    {getActivityLogCategoryLabel(entry.category)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusChipClassName(entry.status)}`}
                    data-testid="activity-log-status-badge"
                  >
                    {getActivityLogStatusLabel(entry.status)}
                  </span>
                  <time className="text-xs text-[#64748B]" dateTime={entry.occurredAt}>
                    {formatActivityLogTimestamp(entry.occurredAt)}
                  </time>
                </div>

                <p className="text-sm font-medium text-[#0F172A]" data-testid="activity-log-message">
                  {entry.message}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B]">
                  {entry.actorLabel ? (
                    <p data-testid="activity-log-actor">
                      <span className="font-medium text-[#334155]">Ator:</span> {entry.actorLabel}
                    </p>
                  ) : null}
                  {entry.entityLabel || entry.entityType || entry.entityId ? (
                    <p data-testid="activity-log-entity">
                      <span className="font-medium text-[#334155]">Entidade:</span>{" "}
                      {entry.entityLabel ?? entry.entityType ?? "referência"}{" "}
                      {entry.entityId ? `(${entry.entityId})` : ""}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {hasMore ? (
          <div className="pt-1">
            <Link
              href={loadMoreHref}
              className="inline-flex h-10 items-center rounded-lg border border-[#CBD5E1] bg-white px-4 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC]"
              data-testid="activity-logs-load-more"
            >
              Carregar mais
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
