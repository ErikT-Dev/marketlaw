const HEX_PAIR = /[0-9a-f]{2}/giu;
const CHANNEL_MAX = 255;
const LINEAR_LIMIT = 0.04045;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA = 2.4;
const WEIGHTS = [0.2126, 0.7152, 0.0722] as const;
const FLARE = 0.05;

function linearChannelOf(channel: number): number {
  const scaled = channel / CHANNEL_MAX;
  return scaled <= LINEAR_LIMIT
    ? scaled / LINEAR_DIVISOR
    : ((scaled + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA;
}

function luminanceOf(color: string): number {
  const channels = (color.match(HEX_PAIR) ?? []).map((pair) => parseInt(pair, 16));
  return WEIGHTS.reduce(
    (total, weight, index) => total + weight * linearChannelOf(channels[index] ?? 0),
    0,
  );
}

export function iconColorContrastOf(first: string, second: string): number {
  const [lighter, darker] = [luminanceOf(first), luminanceOf(second)].sort((a, b) => b - a);
  return ((lighter ?? 0) + FLARE) / ((darker ?? 0) + FLARE);
}
