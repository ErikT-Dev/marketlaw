import { TENTHS_PER_FUND } from "./TENTHS_PER_FUND";

export function wholeFundsOf(fundsInTenths: number): number {
  return Math.floor(fundsInTenths / TENTHS_PER_FUND);
}
