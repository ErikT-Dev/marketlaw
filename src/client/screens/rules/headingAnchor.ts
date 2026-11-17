export function headingAnchor(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/ /g, "-");
}
