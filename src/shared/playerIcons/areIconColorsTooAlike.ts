import { ICON_COLOR_CONTRAST_MINIMUM } from "./ICON_COLOR_CONTRAST_MINIMUM";
import { iconColorContrastOf } from "./iconColorContrastOf";

export function areIconColorsTooAlike(background: string, color: string): boolean {
  return iconColorContrastOf(background, color) < ICON_COLOR_CONTRAST_MINIMUM;
}
