import { afterEach, describe, expect, it, vi } from "vitest";
import { supportsWebGL } from "./webglSupport";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("globe WebGL capability probe", () => {
  it("does not allocate a context when document is unavailable", () => {
    vi.stubGlobal("document", undefined);
    expect(supportsWebGL()).toBe(false);
  });

  it("releases a temporary WebGL context after checking support", () => {
    const loseContext = vi.fn();
    const getExtension = vi.fn(() => ({ loseContext }));
    const getContext = vi.fn((kind: string) =>
      kind === "webgl2" ? { getExtension } : null
    );
    const createElement = vi.fn(() => ({ getContext }));
    vi.stubGlobal("document", { createElement });

    expect(supportsWebGL()).toBe(true);
    expect(createElement).toHaveBeenCalledTimes(1);
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(getContext).toHaveBeenCalledWith("webgl2");
    expect(getExtension).toHaveBeenCalledWith("WEBGL_lose_context");
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it("returns false without WebGL and handles blocked probes", () => {
    const getContext = vi.fn(() => null);
    vi.stubGlobal("document", { createElement: () => ({ getContext }) });
    expect(supportsWebGL()).toBe(false);

    vi.stubGlobal("document", {
      createElement: () => {
        throw new Error("Canvas disabled");
      },
    });
    expect(supportsWebGL()).toBe(false);
  });
});
