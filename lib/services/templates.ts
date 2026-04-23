import type { Template, TemplateCategory } from "@/lib/domain/template";
import {
  createTemplate as createTemplateInStorage,
  getActiveTemplates as getActiveTemplatesFromStorage,
  getTemplates as getTemplatesFromStorage,
  getTemplatesByCategory as getTemplatesByCategoryFromStorage,
  toggleTemplateActive as toggleTemplateActiveInStorage,
  updateTemplate as updateTemplateInStorage,
  type CreateTemplateInput,
  type UpdateTemplatePatch,
} from "@/lib/template-storage";
import {
  getTemplateCreationAccessState,
  type LimitAccessState,
} from "@/lib/services/plan-entitlements";

export const TEMPLATE_CATEGORY_ORDER: TemplateCategory[] = [
  "quote_followup",
  "payment_reminder",
  "approval_prompt",
  "general",
];

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  quote_followup: "Follow-up de orçamento",
  payment_reminder: "Lembrete de pagamento",
  approval_prompt: "Solicitação de aprovação",
  general: "Geral",
};

export type CreateTemplateWithPlanResult =
  | {
      ok: true;
      template: Template;
      limit: LimitAccessState;
      message: null;
    }
  | {
      ok: false;
      template: null;
      limit: LimitAccessState;
      message: string;
    };

export function getTemplates(): Template[] {
  return getTemplatesFromStorage();
}

export function createTemplate(input: CreateTemplateInput): Template | null {
  return createTemplateInStorage(input);
}

export function getTemplatePlanLimitState(): LimitAccessState {
  return getTemplateCreationAccessState();
}

export function createTemplateWithPlanCheck(
  input: CreateTemplateInput
): CreateTemplateWithPlanResult {
  const limit = getTemplateCreationAccessState();

  if (limit.blocked) {
    return {
      ok: false,
      template: null,
      limit,
      message: limit.reason ?? "Você atingiu o limite do seu plano atual.",
    };
  }

  const template = createTemplateInStorage(input);

  if (template === null) {
    return {
      ok: false,
      template: null,
      limit: getTemplateCreationAccessState(),
      message: "Não foi possível salvar o modelo.",
    };
  }

  return {
    ok: true,
    template,
    limit: getTemplateCreationAccessState(),
    message: null,
  };
}

export function updateTemplate(id: string, patch: UpdateTemplatePatch): Template | null {
  return updateTemplateInStorage(id, patch);
}

export function toggleTemplateActive(id: string): Template | null {
  return toggleTemplateActiveInStorage(id);
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return getTemplatesByCategoryFromStorage(category);
}

export function getActiveTemplates(): Template[] {
  return getActiveTemplatesFromStorage();
}

export function getTemplateGroups(templates: Template[]): Array<{
  category: TemplateCategory;
  label: string;
  items: Template[];
}> {
  return TEMPLATE_CATEGORY_ORDER.map((category) => ({
    category,
    label: TEMPLATE_CATEGORY_LABELS[category],
    items: templates.filter((item) => item.category === category),
  }));
}

export function getTemplatePreview(content: string, maxLength: number = 120): string {
  const normalized = content.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}
