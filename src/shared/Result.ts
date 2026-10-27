export type Result<T, E> =
  { readonly isOk: true; readonly value: T } | { readonly isOk: false; readonly error: E };
