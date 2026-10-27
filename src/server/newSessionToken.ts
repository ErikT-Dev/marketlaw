const TOKEN_BYTES = 32;

export function newSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
