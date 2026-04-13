import type { Template, TemplateCategory } from "@/lib/domain/template";

const STORAGE_KEY = "firmus.templates";

export type CreateTemplateInput = {
  name: string;
  category: TemplateCategory;
  content: string;
  isActive?: boolean;
};

export type UpdateTemplatePatch = {
  name?: string;
  category?: TemplateCategory;
  content?: string;
  isActive?: boolean;
};

const CATEGORY_SET: ReadonlySet<TemplateCategory> = new Set([
  "quote_followup",
  "payment_reminder",
  "approval_prompt",
  "general",
]);

function generateTemplateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `template_${Date.now()}_${Math.floor(Math.random() * 10_000)}`;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asCategory(value: unknown): TemplateCategory {
  if (typeof value === "string" && CATEGORY_SET.has(value as TemplateCategory)) {
    return value as TemplateCategory;
  }

  return "general";
}

function asIsoDate(value: unknown): string {
  if (typeof value !== "string") {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function normalizeTemplate(raw: unknown): Template | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const name = asNonEmptyString(data.name);
  const content = asNonEmptyString(data.content);

  if (name === null || content === null) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    id: asNonEmptyString(data.id) ?? generateTemplateId(),
    name,
    category: asCategory(data.category),
    content,
    isActive: data.isActive !== false,
    createdAt: data.createdAt === undefined ? now : asIsoDate(data.createdAt),
    updatedAt: data.updatedAt === undefined ? now : asIsoDate(data.updatedAt),
  };
}

function normalizeTemplates(raw: unknown): Template[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => normalizeTemplate(item))
    .filter((item): item is Template => item !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function persistTemplates(templates: Template[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getTemplates(): Template[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeTemplates(parsed);
    persistTemplates(normalized);
    return normalized;
  } catch {
    return [];
  }
}

export function createTemplate(input: CreateTemplateInput): Template | null {
  const name = asNonEmptyString(input.name);
  const content = asNonEmptyString(input.content);

  if (name === null || content === null) {
    return null;
  }

  const existing = getTemplates();
  const now = new Date().toISOString();

  const template: Template = {
    id: generateTemplateId(),
    name,
    category: asCategory(input.category),
    content,
    isActive: input.isActive !== false,
    createdAt: now,
    updatedAt: now,
  };

  persistTemplates([template, ...existing]);
  return template;
}

export function updateTemplate(id: string, patch: UpdateTemplatePatch): Template | null {
  const templateId = asNonEmptyString(id);
  if (templateId === null) {
    return null;
  }

  const existing = getTemplates();
  const target = existing.find((item) => item.id === templateId);
  if (!target) {
    return null;
  }

  const nextName = patch.name === undefined ? target.name : asNonEmptyString(patch.name);
  const nextContent = patch.content === undefined ? target.content : asNonEmptyString(patch.content);

  if (nextName === null || nextContent === null) {
    return null;
  }

  const updated: Template = {
    ...target,
    name: nextName,
    category: patch.category === undefined ? target.category : asCategory(patch.category),
    content: nextContent,
    isActive: patch.isActive === undefined ? target.isActive : patch.isActive,
    updatedAt: new Date().toISOString(),
  };

  const normalized = existing
    .map((item) => (item.id === templateId ? updated : item))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  persistTemplates(normalized);
  return updated;
}

export function toggleTemplateActive(id: string): Template | null {
  const existing = getTemplates();
  const target = existing.find((item) => item.id === id);

  if (!target) {
    return null;
  }

  return updateTemplate(id, { isActive: !target.isActive });
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return getTemplates().filter((item) => item.category === category);
}

export function getActiveTemplates(): Template[] {
  return getTemplates().filter((item) => item.isActive);
}
