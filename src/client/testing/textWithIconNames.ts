export function textWithIconNames(node: Node): string {
  if (node instanceof Element && node.getAttribute("role") === "img") {
    return `[${node.getAttribute("aria-label") ?? ""}]`;
  }
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  return Array.from(node.childNodes, textWithIconNames).join("");
}
