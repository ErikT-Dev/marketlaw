import { isRecord } from "../harness-check/isRecord.ts";

function describeValue(value: unknown): string {
  return value === undefined ? "nothing" : JSON.stringify(value);
}

function arrayMismatches(
  expected: ReadonlyArray<unknown>,
  actual: unknown,
  path: string,
): ReadonlyArray<string> {
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    return [`${path}: expected ${describeValue(expected)}, got ${describeValue(actual)}`];
  }
  const actualItems: ReadonlyArray<unknown> = actual;
  return expected.flatMap((item, index) =>
    findMismatches(item, actualItems[index], `${path}[${index}]`),
  );
}

export function findMismatches(
  expected: unknown,
  actual: unknown,
  path: string,
): ReadonlyArray<string> {
  if (Array.isArray(expected)) {
    return arrayMismatches(expected, actual, path);
  }
  if (isRecord(expected)) {
    if (!isRecord(actual)) {
      return [`${path}: expected ${describeValue(expected)}, got ${describeValue(actual)}`];
    }
    return Object.entries(expected).flatMap(([key, value]) =>
      findMismatches(value, actual[key], `${path}.${key}`),
    );
  }
  return Object.is(expected, actual)
    ? []
    : [`${path}: expected ${describeValue(expected)}, got ${describeValue(actual)}`];
}
