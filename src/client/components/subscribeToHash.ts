export function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
  };
}
