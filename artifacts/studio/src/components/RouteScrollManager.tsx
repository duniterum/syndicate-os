import { useEffect, useRef } from "react";
import { useLocationProperty } from "wouter/use-browser-location";

const HEADER_OFFSET = 80;
// A hash target can mount LATE (e.g. /member#settings: the section exists only
// after the session resolves to the signed-in composition), so a single
// attempt is a dead click. Retry briefly; user input (wheel, touch, key,
// pointer) cancels the pending scroll — it is theirs from that moment.
const HASH_RETRY_MS = 200;
const HASH_RETRY_MAX = 25; // ~5s window

function resetScrollRoots() {
  document
    .querySelectorAll<HTMLElement>("[data-scroll-root]")
    .forEach((el) => {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    });
}

function resetToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  resetScrollRoots();
}

/** Scroll the window so the hash target sits under the sticky header.
 * Returns false when the target does not exist (yet); a no-op when already
 * in place. Exported for same-URL re-clicks (MemberShell): wouter Links
 * never reach the browser's native same-hash re-scroll. */
export function scrollToHash(hash: string): boolean {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const top = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
  );
  if (Math.abs(window.scrollY - top) > 1) {
    window.scrollTo({ top, left: 0, behavior: "auto" });
  }
  return true;
}

// pathname+hash, reactive. wouter's useLocation is PATHNAME-ONLY and a wouter
// <Link href="/member#settings"> navigates via history.pushState, which fires
// NO hashchange event — so a hash-only navigation was invisible to the old
// location effect (the audit's dead-click doors). useLocationProperty
// subscribes to pushState/replaceState/popstate/hashchange and sees it.
// SEARCH is deliberately excluded: a query-only change never resets scroll.
const currentPathWithHash = () => window.location.pathname + window.location.hash;

/**
 * Mounted once near the router root. Keeps internal navigation landing at the
 * top of the destination (and resets the inner Shell scroll container, which
 * React reuses across Shell routes), while leaving the browser's native
 * back/forward scroll restoration alone. Hash navigations scroll to their
 * target, retrying while a late-mounting section renders.
 */
export function RouteScrollManager() {
  const location = useLocationProperty(currentPathWithHash);
  const isPopRef = useRef(false);
  const isFirstRef = useRef(true);

  // Mark back/forward navigations so we can defer to native scroll restoration.
  useEffect(() => {
    const onPop = () => {
      isPopRef.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const wasPop = isPopRef.current;
    isPopRef.current = false;
    const wasFirst = isFirstRef.current;
    isFirstRef.current = false;

    const hash = window.location.hash;

    if (hash) {
      // Anchor navigation: land at the top while the target mounts, then jump
      // to it as soon as it exists — unless the user has taken over. After the
      // first successful jump the loop keeps CORRECTING drift for the rest of
      // the window (drift check inside scrollToHash): lazy content mounting
      // ABOVE the target grows the page and pushes it away, and Safari has no
      // scroll anchoring to compensate.
      let tries = 0;
      let found = false;
      let timer: number | undefined;
      let cancelled = false;
      // pointerdown/mousedown cover clicks, drags and middle-click autoscroll
      // (Chromium fires them for scrollbar grabs too; Firefox's native
      // scrollbar dispatches nothing — accepted residual).
      const cancelEvents = [
        "wheel",
        "touchmove",
        "keydown",
        "pointerdown",
        "mousedown",
      ] as const;
      const cancel = () => {
        if (cancelled) return;
        cancelled = true;
        if (timer !== undefined) window.clearTimeout(timer);
        for (const e of cancelEvents) window.removeEventListener(e, cancel);
      };
      const attempt = () => {
        if (cancelled) return;
        if (scrollToHash(hash)) {
          found = true;
        } else if (!found && tries === 0 && !wasPop) {
          resetToTop();
        }
        tries += 1;
        if (tries < HASH_RETRY_MAX) timer = window.setTimeout(attempt, HASH_RETRY_MS);
        else cancel();
      };
      for (const e of cancelEvents)
        window.addEventListener(e, cancel, { passive: true });
      // setTimeout, NOT requestAnimationFrame: rAF never fires in a hidden /
      // occluded tab (rig-proven), and the retry loop already absorbs paint
      // timing — a timer keeps the scroll working everywhere.
      timer = window.setTimeout(attempt, 0);
      return cancel;
    }

    if (wasPop) {
      // Let the browser restore native window scroll (works for the public,
      // window-scrolled page). The reused Shell scroll container cannot be
      // natively restored and would otherwise retain a stale position, so
      // reset only the inner scroll container(s) to the top.
      resetScrollRoots();
      return undefined;
    }

    // First load with no hash: don't force a jump (preserve any deep link).
    if (wasFirst) return undefined;

    resetToTop();
    return undefined;
  }, [location]);

  return null;
}
