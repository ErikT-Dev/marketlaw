import { TENTHS_PER_FUND } from "./TENTHS_PER_FUND";

export function fundsInTenths(wholeFunds: number): number {
  return wholeFunds * TENTHS_PER_FUND;
}
