export type ActivityLogCategory = "operacao" | "seguranca" | "automacao" | "privacidade";

export type ActivityLogCategoryFilter = "todos" | ActivityLogCategory;

export type ActivityLogStatus = "sucesso" | "falha" | "info";

export type ActivityLogActorType = "owner" | "anonymous" | "system" | "integration";

export type ActivityLogMetadataValue = string | number | boolean | null;

export type ActivityLogEntityRef = {
  type: string;
  id: string;
  label?: string;
};

export type ActivityLogEntry = {
  id: string;
  category: ActivityLogCategory;
  action: string;
  occurredAt: string;
  status: ActivityLogStatus;
  message: string;
  actorType: ActivityLogActorType;
  actorLabel: string | null;
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  metadata?: Record<string, ActivityLogMetadataValue>;
};

const CATEGORY_BY_ACTION: Record<string, ActivityLogCategory> = {
  auth_login_success: "seguranca",
  auth_login_failure: "seguranca",
  auth_logout: "seguranca",
  private_route_access_denied: "seguranca",
  private_api_access_denied: "seguranca",
  security_config_error: "seguranca",
  privacy_foundation_review_recorded: "privacidade",
  automation_rule_created: "automacao",
  automation_rule_enabled: "automacao",
  automation_rule_disabled: "automacao",
  automation_reminder_created: "automacao",
  quote_approved: "operacao",
  charge_marked_paid: "operacao",
};

const STATUS_BY_ACTION: Record<string, ActivityLogStatus> = {
  auth_login_success: "sucesso",
  auth_login_failure: "falha",
  auth_logout: "sucesso",
  private_route_access_denied: "falha",
  private_api_access_denied: "falha",
  security_config_error: "falha",
  privacy_foundation_review_recorded: "sucesso",
  automation_rule_created: "sucesso",
  automation_rule_enabled: "sucesso",
  automation_rule_disabled: "info",
  automation_reminder_created: "sucesso",
  quote_approved: "sucesso",
  charge_marked_paid: "sucesso",
};

const MESSAGE_BY_ACTION: Record<string, string> = {
  auth_login_success: "Login bem-sucedido.",
  auth_login_failure: "Login falho.",
  auth_logout: "Logout realizado.",
  private_route_access_denied: "Acesso negado a rota privada.",
  private_api_access_denied: "Acesso negado a endpoint interno protegido.",
  security_config_error: "Falha de configuração de segurança detectada.",
  privacy_foundation_review_recorded: "Revisão de privacidade registrada.",
  automation_rule_created: "Regra criada.",
  automation_rule_enabled: "Regra ativada.",
  automation_rule_disabled: "Regra desativada.",
  automation_reminder_created: "Lembrete automático criado.",
  quote_approved: "Orçamento aprovado.",
  charge_marked_paid: "Cobrança marcada como paga.",
};

export const ACTIVITY_LOG_CATEGORY_FILTER_OPTIONS: ActivityLogCategoryFilter[] = [
  "todos",
  "operacao",
  "seguranca",
  "automacao",
  "privacidade",
];

const CATEGORY_LABELS: Record<ActivityLogCategoryFilter, string> = {
  todos: "Todos",
  operacao: "Operação",
  seguranca: "Segurança",
  automacao: "Automação",
  privacidade: "Privacidade",
};

const STATUS_LABELS: Record<ActivityLogStatus, string> = {
  sucesso: "Sucesso",
  falha: "Falha",
  info: "Informativo",
};

function normalizeString(value: string): string {
  return value.trim().toLowerCase();
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toTimestamp(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function inferCategoryFromAction(action: string): ActivityLogCategory {
  if (action.startsWith("privacy_")) {
    return "privacidade";
  }

  if (action.startsWith("automation_")) {
    return "automacao";
  }

  if (action.startsWith("quote_") || action.startsWith("charge_")) {
    return "operacao";
  }

  return "seguranca";
}

function inferStatusFromAction(action: string): ActivityLogStatus {
  if (action.includes("failure") || action.includes("denied") || action.includes("error")) {
    return "falha";
  }

  return "info";
}

export function resolveActivityLogCategoryFromAction(action: string): ActivityLogCategory {
  const normalized = normalizeString(action);
  return CATEGORY_BY_ACTION[normalized] ?? inferCategoryFromAction(normalized);
}

export function resolveActivityLogStatusFromAction(action: string): ActivityLogStatus {
  const normalized = normalizeString(action);
  return STATUS_BY_ACTION[normalized] ?? inferStatusFromAction(normalized);
}

export function toActivityLogMessage(action: string): string {
  const normalized = normalizeString(action);
  if (MESSAGE_BY_ACTION[normalized]) {
    return MESSAGE_BY_ACTION[normalized];
  }

  if (normalized.startsWith("automation_")) {
    return "Evento de automação registrado.";
  }

  if (normalized.startsWith("quote_") || normalized.startsWith("charge_")) {
    return "Evento operacional registrado.";
  }

  if (normalized.startsWith("privacy_")) {
    return "Evento de privacidade registrado.";
  }

  return "Evento interno registrado.";
}

export function getActivityLogCategoryLabel(category: ActivityLogCategoryFilter): string {
  return CATEGORY_LABELS[category];
}

export function getActivityLogStatusLabel(status: ActivityLogStatus): string {
  return STATUS_LABELS[status];
}

export function normalizeActivityLogCategoryFilter(
  value: string | string[] | null | undefined
): ActivityLogCategoryFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return "todos";
  }

  const normalized = normalizeString(raw);
  return ACTIVITY_LOG_CATEGORY_FILTER_OPTIONS.includes(
    normalized as ActivityLogCategoryFilter
  )
    ? (normalized as ActivityLogCategoryFilter)
    : "todos";
}

export function normalizeActivityLogQuery(value: string | string[] | null | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return asString(raw) ?? "";
}

export function normalizeActivityLogLimit(
  value: string | string[] | null | undefined,
  fallback = 40,
  minimum = 1,
  maximum = 200
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, parsed));
}

export function sortActivityLogsReverseChronological(entries: ActivityLogEntry[]): ActivityLogEntry[] {
  return [...entries].sort((left, right) => {
    const rightTimestamp = toTimestamp(right.occurredAt);
    const leftTimestamp = toTimestamp(left.occurredAt);

    if (rightTimestamp !== leftTimestamp) {
      return rightTimestamp - leftTimestamp;
    }

    return right.id.localeCompare(left.id);
  });
}

export function buildActivityLogSearchText(entry: ActivityLogEntry): string {
  const metadataText = Object.values(entry.metadata ?? {})
    .filter((value) => value !== null)
    .map((value) => String(value))
    .join(" ");

  return [
    entry.action,
    entry.message,
    entry.actorLabel ?? "",
    entry.entityLabel ?? "",
    entry.entityType ?? "",
    entry.entityId ?? "",
    metadataText,
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesActivityLogSearch(entry: ActivityLogEntry, query: string): boolean {
  const normalizedQuery = normalizeString(query);
  if (normalizedQuery.length === 0) {
    return true;
  }

  return buildActivityLogSearchText(entry).includes(normalizedQuery);
}

export function filterActivityLogs(
  entries: ActivityLogEntry[],
  options: {
    category?: ActivityLogCategoryFilter;
    query?: string;
  }
): ActivityLogEntry[] {
  const category = options.category ?? "todos";
  const query = options.query ?? "";

  return entries.filter((entry) => {
    const categoryMatches = category === "todos" || entry.category === category;
    if (!categoryMatches) {
      return false;
    }

    return matchesActivityLogSearch(entry, query);
  });
}

export function formatActivityLogTimestamp(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}
