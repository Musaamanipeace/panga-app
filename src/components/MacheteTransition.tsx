import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Plays the "Machete Cut" transition (diagonal metallic stroke, then a
 * two-stage screen split) whenever the route changes. Mounted once near the
 * root so it fires for every full-page route change.
 */
export default function MacheteTransition() {
  const location = useLocation();
  const [playing, setPlaying] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setPlaying(true);
    const timer = setTimeout(() => setPlaying(false), 600); // 0.25s stroke + 0.35s split
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!playing) return null;

  return (
    <div className="machete-overlay" aria-hidden="true">
      <div className="machete-stroke" />
      <div className="machete-half machete-half-tr" />
      <div className="machete-half machete-half-bl" />
    </div>
  );
}

/** Imperatively trigger the cut (used before an OTP submit navigates away). */
export function playMacheteCut(durationMs = 350): Promise<void> {
  return new Promise((resolve) => {
    const el = document.createElement("div");
    el.className = "machete-overlay machete-overlay-manual";
    el.innerHTML =
      '<div class="machete-stroke"></div><div class="machete-half machete-half-tr"></div><div class="machete-half machete-half-bl"></div>';
    document.body.appendChild(el);
    setTimeout(() => {
      el.remove();
      resolve();
    }, durationMs);
  });
}
