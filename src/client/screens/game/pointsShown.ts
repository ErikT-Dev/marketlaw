const HUNDREDTHS_PER_POINT = 100;

export function pointsShown(hundredths: number): string {
  const points = String(Number((hundredths / HUNDREDTHS_PER_POINT).toFixed(2)));
  return points.replace("-", "−");
}
