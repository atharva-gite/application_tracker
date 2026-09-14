export function toSearchParams(
  query: Record<string, string | number | undefined | null>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  return params;
}

export function withQuery(
  pathname: string,
  query: Record<string, string | number | undefined | null>,
) {
  const params = toSearchParams(query);
  const encoded = params.toString();
  return encoded ? `${pathname}?${encoded}` : pathname;
}
