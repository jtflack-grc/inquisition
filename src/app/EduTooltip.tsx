import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  positionTeachPopover,
  type TeachPopoverPosition,
} from "./teachPopoverPlacement";

export interface EduTooltipProps {
  title: string;
  body: string;
  /** Optional badge label in the popover header */
  badge?: "FAIR" | "FMVA" | "Intro" | "CRQ";
  className?: string;
}

/**
 * Click-to-open instructional popover.
 * Portal to document.body escapes all three rails' overflow and z-index stacks.
 * Viewport placement accounts for scrolling, resizing, bottom-edge and mobile.
 */
export function EduTooltip({
  title,
  body,
  badge,
  className = "",
}: EduTooltipProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<TeachPopoverPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusedForThisOpen = useRef(false);
  const panelId = useId();
  const headingId = useId();
  const close = useCallback(() => setOpen(false), []);

  const reposition = useCallback((measuredHeight?: number) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const next = positionTeachPopover(
      rect,
      window.innerWidth,
      window.innerHeight,
      measuredHeight
    );
    setPlacement((prev) =>
      prev &&
      prev.top === next.top &&
      prev.left === next.left &&
      prev.width === next.width &&
      prev.maxHeight === next.maxHeight &&
      prev.side === next.side
        ? prev
        : next
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      focusedForThisOpen.current = false;
      setPlacement(null);
      return;
    }
    reposition();
  }, [open, reposition]);

  // Adjust for actual rendered panel height (body lengths vary significantly).
  useLayoutEffect(() => {
    if (!open || !placement || !panelRef.current) return;
    const height = panelRef.current.getBoundingClientRect().height;
    if (height > 0) reposition(height);
  }, [open, placement, reposition]);

  // Nonmodal dialog is portalled to body, so keyboard users must be placed
  // inside it once when opened rather than tabbing through the entire page.
  useLayoutEffect(() => {
    if (!open || !placement || focusedForThisOpen.current) return;
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    focusedForThisOpen.current = true;
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        close();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };
    const onViewportChange = () => {
      reposition(panelRef.current?.getBoundingClientRect().height);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKeyDown);
    // Capture scroll events from *any* scrollable rail or nested evidence section.
    window.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [open, close, reposition]);

  return (
    <span className={`inline-flex align-middle ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center justify-center min-h-[28px] min-w-[28px] rounded-full border border-slate-400/90 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        aria-label={`Learn more: ${title}`}
        aria-haspopup="dialog"
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
      {open &&
        placement &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={headingId}
            className="inquisition-teachable"
            data-side={placement.side}
            style={{
              position: "fixed",
              top: placement.top,
              left: placement.left,
              width: placement.width,
              maxHeight: placement.maxHeight,
              zIndex: 2147483000,
            }}
          >
            <div className="inquisition-teachable__header">
              <div className="inquisition-teachable__heading">
                <span id={headingId}>{title}</span>
                {badge && (
                  <span className="inquisition-teachable__badge">{badge}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  close();
                  triggerRef.current?.focus();
                }}
                className="inquisition-teachable__close"
                aria-label="Close explanation"
              >
                ×
              </button>
            </div>
            <p className="inquisition-teachable__body">{body}</p>
          </div>,
          document.body
        )}
    </span>
  );
}
