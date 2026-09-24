export const DEFAULT_TIMEZONE = "UTC";

export function isValidTimeZone(timeZone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function resolveTimeZone(timeZone: string | null | undefined) {
  if (timeZone && isValidTimeZone(timeZone)) {
    return timeZone;
  }
  return DEFAULT_TIMEZONE;
}

export function systemTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function calendarDateInZone(date: Date, timeZone?: string | null) {
  const zone = resolveTimeZone(timeZone ?? systemTimeZone());
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function zonedDateTimeParts(date: Date, timeZone?: string | null) {
  const zone = resolveTimeZone(timeZone ?? systemTimeZone());
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const hour = parts.hour === "24" ? 0 : Number(parts.hour);
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

export function dayDiffInZone(from: Date | string, to: Date | string, timeZone?: string | null) {
  const fromKey = typeof from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(from)
    ? from
    : calendarDateInZone(from instanceof Date ? from : new Date(from), timeZone);
  const toKey = typeof to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(to)
    ? to
    : calendarDateInZone(to instanceof Date ? to : new Date(to), timeZone);
  const fromUtc = Date.parse(`${fromKey}T00:00:00.000Z`);
  const toUtc = Date.parse(`${toKey}T00:00:00.000Z`);
  return Math.round((toUtc - fromUtc) / 86_400_000);
}

export function fromZonedDateTime(value: string, timeZone?: string | null) {
  if (/[zZ]$/.test(value) || /[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }

  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    ? `${value}:00`
    : value.replace(/\.\d+$/, "");
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    const fallback = new Date(value);
    if (Number.isNaN(fallback.getTime())) {
      throw new Error("Invalid date and time.");
    }
    return fallback;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const zone = resolveTimeZone(timeZone);

  let instant = utcGuess;
  for (let index = 0; index < 2; index += 1) {
    const parts = zonedDateTimeParts(new Date(instant), zone);
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    instant = utcGuess - (asUtc - instant);
  }

  return new Date(instant);
}

export function formatZonedTime(date: Date, timeZone?: string | null) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: resolveTimeZone(timeZone ?? systemTimeZone()),
  });
}

export function formatZonedDay(date: Date, timeZone?: string | null) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: resolveTimeZone(timeZone ?? systemTimeZone()),
  });
}

export function toDateTimeLocalInZone(value: string | null | undefined, timeZone?: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const parts = zonedDateTimeParts(date, timeZone);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}
