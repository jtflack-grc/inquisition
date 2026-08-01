import { useCallback, useEffect, useId, useRef, useState } from "react";

export interface EduTooltipProps {
  title: string;
  body: string;
  /** Optional badge label in the popover header */
  badge?: "FAIR" | "FMVA" | "Intro" | "CRQ";
  className?: string;
}

/**
 * Accessible info popover: click to toggle (no hover-only), Escape closes, click-outside closes,
 * min 28×28px trigger for touch targets.
 */
export function EduTooltip({
  title,
  body,
  badge,
  className = "",
}: EduTooltipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span ref={containerRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center justify-center min-h-[28px] min-w-[28px] rounded-full border border-slate-400/90 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        aria-label={`Learn more: ${title}`}
        aria-expanded={open}
        aria-controls={panelId}
        id={`${panelId}-trigger`}
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-label={title}
          className="absolute z-[100] left-0 top-full mt-1.5 w-72 max-w-[90vw] rounded-lg border border-slate-500 bg-slate-900 shadow-xl p-3 text-left"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold text-white pr-2">
              {title}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {badge && (
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    badge === "FAIR"
                      ? "bg-amber-500/25 text-amber-200"
                      : badge === "FMVA"
                        ? "bg-emerald-500/25 text-emerald-200"
                        : badge === "Intro"
                          ? "bg-sky-500/25 text-sky-200"
                          : "bg-violet-500/25 text-violet-200"
                  }`}
                >
                  {badge}
                </span>
              )}
              <button
                type="button"
                onClick={close}
                className="rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
                aria-label="Close help"
              >
                ✕
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-200 leading-relaxed">{body}</p>
        </div>
      )}
    </span>
  );
}
