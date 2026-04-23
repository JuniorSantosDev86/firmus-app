function toDateOnlyKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseCompetenceMonth(competenceMonth: string): { year: number; month: number } | null {
  const match = competenceMonth.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  if (month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

export function getDASDueDateFromCompetenceMonth(competenceMonth: string): Date | null {
  const parsed = parseCompetenceMonth(competenceMonth);
  if (!parsed) {
    return null;
  }

  const dueMonthIndex = parsed.month === 12 ? 0 : parsed.month;
  const dueYear = parsed.month === 12 ? parsed.year + 1 : parsed.year;

  return new Date(Date.UTC(dueYear, dueMonthIndex, 20, 0, 0, 0, 0));
}

export function isDASOverdueByCompetenceMonth(
  competenceMonth: string,
  referenceDate: Date = new Date()
): boolean {
  const dueDate = getDASDueDateFromCompetenceMonth(competenceMonth);
  if (!dueDate) {
    return false;
  }

  return toDateOnlyKey(dueDate) < toDateOnlyKey(referenceDate);
}
