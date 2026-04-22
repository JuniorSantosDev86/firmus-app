function toDateOnlyKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toDateOnlyKeyFromISO(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return toDateOnlyKey(parsed);
}

export function isDASDueDateOverdue(dueDate: string, referenceDate: Date = new Date()): boolean {
  const dueDateKey = toDateOnlyKeyFromISO(dueDate);
  if (dueDateKey === null) {
    return false;
  }

  return dueDateKey < toDateOnlyKey(referenceDate);
}
