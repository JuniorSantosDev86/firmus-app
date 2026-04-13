"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Template, TemplateCategory } from "@/lib/domain/template";
import {
  createTemplate,
  getTemplateGroups,
  getTemplatePreview,
  getTemplates,
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_ORDER,
  toggleTemplateActive,
  updateTemplate,
} from "@/lib/services/templates";

type TemplateFormValues = {
  name: string;
  category: TemplateCategory;
  content: string;
};

const INITIAL_FORM_VALUES: TemplateFormValues = {
  name: "",
  category: "general",
  content: "",
};

function mapTemplateToFormValues(template: Template): TemplateFormValues {
  return {
    name: template.name,
    category: template.category,
    content: template.content,
  };
}

export function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<TemplateFormValues>(INITIAL_FORM_VALUES);
  const [categoryFilter, setCategoryFilter] = useState<"all" | TemplateCategory>("all");

  function refreshTemplates() {
    setTemplates(getTemplates());
  }

  useEffect(() => {
    queueMicrotask(() => {
      refreshTemplates();
    });
  }, []);

  function updateField<K extends keyof TemplateFormValues>(
    key: K,
    value: TemplateFormValues[K]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setFormValues(INITIAL_FORM_VALUES);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId) {
      const updated = updateTemplate(editingId, {
        name: formValues.name,
        category: formValues.category,
        content: formValues.content,
      });

      if (!updated) {
        return;
      }

      refreshTemplates();
      setFormValues(mapTemplateToFormValues(updated));
      return;
    }

    const created = createTemplate({
      name: formValues.name,
      category: formValues.category,
      content: formValues.content,
      isActive: true,
    });

    if (!created) {
      return;
    }

    refreshTemplates();
    resetForm();
  }

  function handleEdit(template: Template) {
    setEditingId(template.id);
    setFormValues(mapTemplateToFormValues(template));
  }

  function handleToggleActive(templateId: string) {
    const updated = toggleTemplateActive(templateId);
    if (!updated) {
      return;
    }

    refreshTemplates();
  }

  const groupedTemplates = useMemo(() => {
    const groups = getTemplateGroups(templates);
    if (categoryFilter === "all") {
      return groups;
    }

    return groups.filter((group) => group.category === categoryFilter);
  }, [templates, categoryFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {editingId ? "Editar modelo" : "Novo modelo"}
          </h2>
          {editingId ? (
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Cancelar edição
            </Button>
          ) : null}
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="template-name" className="text-sm font-medium">
                Nome
              </label>
              <input
                id="template-name"
                name="template-name"
                value={formValues.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                placeholder="Ex.: Follow-up de aprovação"
                required
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="template-category" className="text-sm font-medium">
                Categoria
              </label>
              <select
                id="template-category"
                name="template-category"
                value={formValues.category}
                onChange={(event) => updateField("category", event.target.value as TemplateCategory)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {TEMPLATE_CATEGORY_ORDER.map((category) => (
                  <option key={category} value={category}>
                    {TEMPLATE_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="template-content" className="text-sm font-medium">
                Conteúdo
              </label>
              <textarea
                id="template-content"
                name="template-content"
                value={formValues.content}
                onChange={(event) => updateField("content", event.target.value)}
                className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Escreva a mensagem base para reutilizar no dia a dia."
                required
              />
            </div>
          </div>

          <Button type="submit">{editingId ? "Atualizar modelo" : "Salvar modelo"}</Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Modelos</h2>

          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="template-filter" className="text-muted-foreground">
              Categoria
            </label>
            <select
              id="template-filter"
              name="template-filter"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value as "all" | TemplateCategory)
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todas</option>
              {TEMPLATE_CATEGORY_ORDER.map((category) => (
                <option key={category} value={category}>
                  {TEMPLATE_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {templates.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">Nenhum modelo salvo ainda.</p>
        ) : (
          <div className="mt-5 space-y-6">
            {groupedTemplates.map((group) => (
              <div key={group.category} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">{group.label}</h3>

                {group.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum modelo nesta categoria.</p>
                ) : (
                  <ul className="space-y-3">
                    {group.items.map((template) => (
                      <li
                        key={template.id}
                        className="rounded-xl border border-border bg-background px-4 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{template.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {getTemplatePreview(template.content, 180)}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {template.isActive ? "Ativo" : "Inativo"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(template)}
                            >
                              Editar modelo
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(template.id)}
                            >
                              {template.isActive ? "Inativar" : "Ativar"}
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
