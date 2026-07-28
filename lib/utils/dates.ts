const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatLongDate(date: Date | null) {
  return date ? longDateFormatter.format(date) : "";
}

export function formatDatePeriod(start: Date, end: Date | null) {
  return `${monthYearFormatter.format(start)} — ${end ? monthYearFormatter.format(end) : "Present"}`;
}

export function formatDateInputValue(date: Date | null) {
  return date?.toISOString().slice(0, 10) ?? "";
}

export function parseOptionalDateInput(value: string) {
  return value ? new Date(`${value}T12:00:00Z`) : null;
}
