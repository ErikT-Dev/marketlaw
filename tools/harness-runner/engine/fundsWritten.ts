import { TENTHS_PER_FUND } from "../../../src/shared/TENTHS_PER_FUND.ts";

export function fundsWritten(fundsInTenths: number): number {
  return fundsInTenths / TENTHS_PER_FUND;
}
