/**
 * Probe WebGL only once per globe mount.
 *
 * Browsers cap the number of live WebGL contexts. A check performed on every
 * React render leaks contexts and can evict the actual globe's renderer.
 * Explicitly release the temporary context as soon as we've checked it.
 */
export function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!context) return false;

    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
