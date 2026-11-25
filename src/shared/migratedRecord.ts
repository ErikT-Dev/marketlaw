export function migratedRecord<T extends { readonly schemaVersion: number }>(
  record: T,
  firstPublicVersion: number,
  steps: ReadonlyArray<(older: T) => T>,
): T | null {
  const firstStep = record.schemaVersion - firstPublicVersion;
  if (!Number.isInteger(firstStep) || firstStep < 0 || firstStep > steps.length) {
    return null;
  }
  return steps.slice(firstStep).reduce((migrated, step) => step(migrated), record);
}
