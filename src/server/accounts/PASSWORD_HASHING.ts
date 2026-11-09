export const PASSWORD_HASHING = {
  method: "pbkdf2-sha256",
  iterations: 20_000,
  saltBytes: 16,
  hashBytes: 32,
} as const;
