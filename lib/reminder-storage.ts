import type { Reminder, ReminderSourceType, ReminderStatus } from "@/lib/domain/reminder";

const STORAGE_KEY = "firmus.reminders";

export type CreateReminderInput = {
  title: string;
  description?: string;
  dueDate?: string;
  clientId?: string;
  chargeId?: string;
  quoteId?: string;
  sourceType?: ReminderSourceType;
};

export type UpdateReminderPatch = {
  title?: string;
  description?: string;
  dueDate?: string;
  clientId?: string;
  chargeId?: string;
  quoteId?: string;
  sourceType?: ReminderSourceType;
  status?: ReminderStatus;
};

const SOURCE_TYPES: ReadonlySet<ReminderSourceType> = new Set([
  "manual",
  "charge",
  "quote",
  "client_followup",
]);

function generateReminderId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `reminder_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asRequiredString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function asIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function asStatus(value: unknown): ReminderStatus {
  return value === "done" ? "done" : "pending";
}

function asSourceType(value: unknown): ReminderSourceType {
  if (typeof value === "string" && SOURCE_TYPES.has(value as ReminderSourceType)) {
    return value as ReminderSourceType;
  }

  return "manual";
}

function normalizeReminder(raw: unknown): Reminder | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const title = asRequiredString(data.title);
  if (title.length === 0) {
    return null;
  }

  const now = new Date().toISOString();
  const status = asStatus(data.status);

  const reminder: Reminder = {
    id: asOptionalString(data.id) ?? generateReminderId(),
    title,
    status,
    sourceType: asSourceType(data.sourceType),
    createdAt: typeof data.createdAt === "string" ? data.createdAt : now,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : now,
  };

  const description = asOptionalString(data.description);
  if (description !== undefined) {
    reminder.description = description;
  }

  const dueDate = asIsoDate(data.dueDate);
  if (dueDate !== undefined) {
    reminder.dueDate = dueDate;
  }

  const clientId = asOptionalString(data.clientId);
  if (clientId !== undefined) {
    reminder.clientId = clientId;
  }

  const chargeId = asOptionalString(data.chargeId);
  if (chargeId !== undefined) {
    reminder.chargeId = chargeId;
  }

  const quoteId = asOptionalString(data.quoteId);
  if (quoteId !== undefined) {
    reminder.quoteId = quoteId;
  }

  if (status === "done") {
    reminder.completedAt = asIsoDate(data.completedAt) ?? reminder.updatedAt;
  }

  return reminder;
}

function normalizeReminders(raw: unknown): Reminder[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeReminder(item))
    .filter((item): item is Reminder => item !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function saveReminders(reminders: Reminder[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export function getReminders(): Reminder[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeReminders(parsed);
    saveReminders(normalized);
    return normalized;
  } catch {
    return [];
  }
}

export function createReminder(input: CreateReminderInput): Reminder | null {
  const title = asRequiredString(input.title);
  if (title.length === 0) {
    return null;
  }

  const existing = getReminders();
  const now = new Date().toISOString();

  const reminder: Reminder = {
    id: generateReminderId(),
    title,
    status: "pending",
    sourceType: asSourceType(input.sourceType),
    createdAt: now,
    updatedAt: now,
  };

  const description = asOptionalString(input.description);
  if (description !== undefined) {
    reminder.description = description;
  }

  const dueDate = asIsoDate(input.dueDate);
  if (dueDate !== undefined) {
    reminder.dueDate = dueDate;
  }

  const clientId = asOptionalString(input.clientId);
  if (clientId !== undefined) {
    reminder.clientId = clientId;
  }

  const chargeId = asOptionalString(input.chargeId);
  if (chargeId !== undefined) {
    reminder.chargeId = chargeId;
  }

  const quoteId = asOptionalString(input.quoteId);
  if (quoteId !== undefined) {
    reminder.quoteId = quoteId;
  }

  saveReminders([reminder, ...existing]);
  return reminder;
}

export function updateReminder(id: string, patch: UpdateReminderPatch): Reminder | null {
  const existing = getReminders();
  const target = existing.find((item) => item.id === id);

  if (!target) {
    return null;
  }

  const nextTitle = patch.title === undefined ? target.title : asRequiredString(patch.title);
  if (nextTitle.length === 0) {
    return null;
  }

  const now = new Date().toISOString();
  const nextStatus = patch.status === undefined ? target.status : asStatus(patch.status);

  const updated: Reminder = {
    ...target,
    title: nextTitle,
    status: nextStatus,
    sourceType: patch.sourceType === undefined ? target.sourceType : asSourceType(patch.sourceType),
    updatedAt: now,
  };

  const nextDescription =
    patch.description === undefined ? target.description : asOptionalString(patch.description);
  if (nextDescription !== undefined) {
    updated.description = nextDescription;
  } else {
    delete updated.description;
  }

  const nextDueDate = patch.dueDate === undefined ? target.dueDate : asIsoDate(patch.dueDate);
  if (nextDueDate !== undefined) {
    updated.dueDate = nextDueDate;
  } else {
    delete updated.dueDate;
  }

  const nextClientId = patch.clientId === undefined ? target.clientId : asOptionalString(patch.clientId);
  if (nextClientId !== undefined) {
    updated.clientId = nextClientId;
  } else {
    delete updated.clientId;
  }

  const nextChargeId = patch.chargeId === undefined ? target.chargeId : asOptionalString(patch.chargeId);
  if (nextChargeId !== undefined) {
    updated.chargeId = nextChargeId;
  } else {
    delete updated.chargeId;
  }

  const nextQuoteId = patch.quoteId === undefined ? target.quoteId : asOptionalString(patch.quoteId);
  if (nextQuoteId !== undefined) {
    updated.quoteId = nextQuoteId;
  } else {
    delete updated.quoteId;
  }

  if (target.status !== "done" && nextStatus === "done") {
    updated.completedAt = now;
  }

  if (nextStatus !== "done") {
    delete updated.completedAt;
  }

  const reminders = existing
    .map((item) => (item.id === id ? updated : item))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  saveReminders(reminders);
  return updated;
}

export function markReminderAsDone(id: string): Reminder | null {
  const existing = getReminders();
  const target = existing.find((item) => item.id === id);

  if (!target || target.status === "done") {
    return null;
  }

  return updateReminder(id, { status: "done" });
}

export function getRemindersByClientId(clientId: string): Reminder[] {
  const id = asRequiredString(clientId);
  if (id.length === 0) {
    return [];
  }

  return getReminders().filter((item) => item.clientId === id);
}

export function getRemindersByChargeId(chargeId: string): Reminder[] {
  const id = asRequiredString(chargeId);
  if (id.length === 0) {
    return [];
  }

  return getReminders().filter((item) => item.chargeId === id);
}
