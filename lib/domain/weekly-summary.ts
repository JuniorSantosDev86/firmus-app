import type { CurrencyInCents, EntityId, ISODate } from "@/lib/domain/common";
import type { TimelineEvent } from "@/lib/domain/timeline-event";

export type WeeklySummaryChargeItem = {
  id: EntityId;
  clientId: EntityId;
  amountInCents: CurrencyInCents;
  dueDate: ISODate;
};

export type WeeklySummaryReminderItem = {
  id: EntityId;
  title: string;
  dueDate?: ISODate;
  completedAt?: ISODate;
  clientId?: EntityId;
};

export type WeeklySummaryActivityItem = {
  id: string;
  type: TimelineEvent["type"];
  entityType: TimelineEvent["entityType"];
  entityId: TimelineEvent["entityId"];
  timestamp: number;
};

export type WeeklySummary = {
  rangeStart: ISODate;
  rangeEnd: ISODate;
  totals: {
    chargesPaidInPeriodInCents: CurrencyInCents;
    chargesPendingInCents: CurrencyInCents;
    overdueChargesInCents: CurrencyInCents;
    pendingRemindersCount: number;
    completedRemindersInPeriodCount: number;
  };
  sections: {
    dueSoonCharges: WeeklySummaryChargeItem[];
    overdueCharges: WeeklySummaryChargeItem[];
    pendingReminders: WeeklySummaryReminderItem[];
    completedRemindersInPeriod: WeeklySummaryReminderItem[];
    recentActivity: WeeklySummaryActivityItem[];
  };
  highlights: string[];
};
