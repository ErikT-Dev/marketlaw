import { TENTHS_PER_FUND } from "../../shared/TENTHS_PER_FUND";

export function tenthsShown(tenths: number): string {
  return (tenths / TENTHS_PER_FUND).toFixed(1);
}
