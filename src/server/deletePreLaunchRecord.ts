type RecordStorage = {
  readonly get: (key: string) => unknown;
  readonly delete: (key: string) => boolean;
};

export function deletePreLaunchRecord(storage: RecordStorage, preLaunchKey: string): void {
  if (storage.get(preLaunchKey) !== undefined) {
    storage.delete(preLaunchKey);
  }
}
