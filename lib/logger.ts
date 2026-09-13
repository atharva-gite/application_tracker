type LogFields = Record<string, unknown>;

function serialize(level: string, message: string, fields?: LogFields) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  return JSON.stringify(payload, (_key, value) => {
    if (typeof value === "string" && looksSensitive(_key)) {
      return "[redacted]";
    }
    return value;
  });
}

function looksSensitive(key: string) {
  const normalized = key.toLowerCase();
  return (
    normalized.includes("password") ||
    normalized.includes("token") ||
    normalized.includes("secret") ||
    normalized.includes("authorization")
  );
}

export const logger = {
  info(message: string, fields?: LogFields) {
    console.info(serialize("info", message, fields));
  },
  warn(message: string, fields?: LogFields) {
    console.warn(serialize("warn", message, fields));
  },
  error(message: string, fields?: LogFields) {
    console.error(serialize("error", message, fields));
  },
};
