const MINUTE_MS = 60_000;

export function gameDurationText(startedAt: number, endedAt: number): string {
  const minutes = Math.max(0, Math.round((endedAt - startedAt) / MINUTE_MS));
  const hours = Math.floor(minutes / 60);
  const rest = `${String(minutes % 60)} min`;
  return hours === 0 ? rest : `${String(hours)} h ${rest}`;
}
