import { MVP_READINESS_GROUP_LABELS, type MVPReadinessGroupKey, type MVPReadinessItem } from "@/lib/domain";

import { MVPReadinessItem as ReadinessItemCard } from "@/components/mvp-readiness/readiness-item";

type ReadinessSectionProps = {
  group: MVPReadinessGroupKey;
  items: MVPReadinessItem[];
};

export function ReadinessSection({ group, items }: ReadinessSectionProps) {
  return (
    <section
      className="firmus-panel space-y-4"
      data-testid={`mvp-readiness-section-${group}`}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {MVP_READINESS_GROUP_LABELS[group]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {items.length} ponto{items.length === 1 ? "" : "s"} acompanhado{items.length === 1 ? "" : "s"} neste grupo.
        </p>
      </div>

      <ul className="space-y-4">
        {items.map((item) => (
          <ReadinessItemCard key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}
