import type { Metadata } from "next";

import { ActivityLogsView } from "@/components/activity-logs/activity-logs-view";
import { PageHeader } from "@/components/layout/page-header";
import {
  normalizeActivityLogCategoryFilter,
  normalizeActivityLogLimit,
  normalizeActivityLogQuery,
} from "@/lib/domain/activity-log";
import { listActivityLogs } from "@/lib/services/activity-logs";

type ActivityLogsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Logs de atividade",
  description: "Trilha interna de eventos relevantes de segurança, privacidade, operação e automação.",
};

export default async function ActivityLogsPage(props: ActivityLogsPageProps) {
  const searchParams = await props.searchParams;
  const category = normalizeActivityLogCategoryFilter(searchParams.category);
  const query = normalizeActivityLogQuery(searchParams.q);
  const limit = normalizeActivityLogLimit(searchParams.limit);

  const result = await listActivityLogs({
    category,
    query,
    limit,
  });

  return (
    <main className="mx-auto w-full max-w-[1120px] space-y-8" data-testid="activity-logs-page">
      <PageHeader
        title="Logs de atividade"
        description="Inspecione os principais eventos internos para contexto operacional, segurança e rastreabilidade mínima."
      />
      <ActivityLogsView
        entries={result.entries}
        totalMatched={result.totalMatched}
        hasMore={result.hasMore}
        category={category}
        query={query}
        limit={result.limit}
      />
    </main>
  );
}
