import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Bot,
  Building2,
  Cpu,
  ClipboardList,
  FileText,
  HandCoins,
  LayoutDashboard,
  Lightbulb,
  ShieldCheck,
  MessageSquareText,
  ReceiptText,
  ScrollText,
  SlidersHorizontal,
  Target,
  Users,
} from "lucide-react";

export type NavigationGroup = "principal" | "operacao" | "inteligencia";

export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: NavigationGroup;
  testId: string;
  description?: string;
};

export const PRIMARY_NAVIGATION: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    group: "principal",
    testId: "nav-dashboard",
    description: "Visão geral da operação atual.",
  },
  {
    id: "business-profile",
    label: "Perfil da Empresa",
    href: "/business-profile",
    icon: Building2,
    group: "principal",
    testId: "nav-business-profile",
  },
  {
    id: "clients",
    label: "Clientes",
    href: "/clients",
    icon: Users,
    group: "principal",
    testId: "nav-clients",
  },
  {
    id: "plan",
    label: "Plano",
    href: "/plan",
    icon: SlidersHorizontal,
    group: "principal",
    testId: "nav-plan",
  },
  {
    id: "mvp-readiness",
    label: "Prontidão do MVP",
    href: "/mvp-readiness",
    icon: ShieldCheck,
    group: "principal",
    testId: "nav-mvp-readiness",
  },
  {
    id: "services",
    label: "Serviços",
    href: "/services",
    icon: ClipboardList,
    group: "principal",
    testId: "nav-services",
  },
  {
    id: "quotes",
    label: "Orçamentos",
    href: "/quotes",
    icon: FileText,
    group: "principal",
    testId: "nav-quotes",
  },
  {
    id: "charges",
    label: "Cobranças",
    href: "/charges",
    icon: HandCoins,
    group: "operacao",
    testId: "nav-charges",
  },
  {
    id: "das",
    label: "DAS",
    href: "/das",
    icon: ReceiptText,
    group: "operacao",
    testId: "nav-das",
  },
  {
    id: "nfse",
    label: "NFSe",
    href: "/nfse",
    icon: ReceiptText,
    group: "operacao",
    testId: "nav-nfse",
  },
  {
    id: "reminders",
    label: "Lembretes",
    href: "/reminders",
    icon: Bell,
    group: "operacao",
    testId: "nav-reminders",
  },
  {
    id: "activity-logs",
    label: "Logs de atividade",
    href: "/activity-logs",
    icon: ScrollText,
    group: "operacao",
    testId: "nav-activity-logs",
  },
  {
    id: "reactivation-radar",
    label: "Radar de reativação",
    href: "/reactivation-radar",
    icon: Target,
    group: "operacao",
    testId: "nav-reactivation-radar",
  },
  {
    id: "templates",
    label: "Modelos",
    href: "/templates",
    icon: MessageSquareText,
    group: "operacao",
    testId: "nav-templates",
  },
  {
    id: "assisted-input",
    label: "Entrada assistida",
    href: "/assisted-input",
    icon: Bot,
    group: "inteligencia",
    testId: "nav-assisted-input",
  },
  {
    id: "assisted-charge-suggestions",
    label: "Sugestões",
    href: "/assisted-charge-suggestions",
    icon: Lightbulb,
    group: "inteligencia",
    testId: "nav-assisted-charge-suggestions",
  },
  {
    id: "automation-rules",
    label: "Regras de automação",
    href: "/automation-rules",
    icon: Cpu,
    group: "inteligencia",
    testId: "nav-automation-rules",
  },
  {
    id: "weekly-summary",
    label: "Resumo semanal",
    href: "/weekly-summary",
    icon: ReceiptText,
    group: "inteligencia",
    testId: "nav-weekly-summary",
  },
  {
    id: "financial-overview",
    label: "Visão Financeira",
    href: "/financial-overview",
    icon: BarChart3,
    group: "inteligencia",
    testId: "nav-financial-overview",
  },
];

export const NAVIGATION_GROUP_LABELS: Record<NavigationGroup, string> = {
  principal: "Principal",
  operacao: "Operação",
  inteligencia: "Inteligência",
};
