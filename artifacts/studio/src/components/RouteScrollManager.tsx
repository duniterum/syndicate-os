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
/** The FULL current url (pathname + search + hash) — the same-door detector
 *  compares this, so a query-only push keeps the settled rule above (a
 *  query-only change never resets scroll). */
const currentFullUrl = () =>
  window.location.pathname + window.location.search + window.location.hash;

export function RouteScrollManager() {
  const location = useLocationProperty(currentPathWithHash);
  const isPopRef = useRef(false);
  const isFirstRef = useRef(true);
  // R-BIND-3 scroll fix (prod, founder: "links land at the bottom"): the two
  // refs the bypass killers compare against — kept current by the location
  // effect below.
  const lastSeenRef = useRef(currentPathWithHash());
  const lastFullRef = useRef(currentFullUrl());

  // MECHANISM-A KILLER — the unguarded same-door click, site-wide: wouter's
  // <Link> pushes even for the URL you are already on; the snapshot string
  // doesn't change, so the location effect never runs and the click reads as
  // "nothing happened" (from a scrolled page: "it landed me at the bottom").
  // Catch it at wouter's own "pushState" event: an IDENTICAL full-url push
  // re-scrolls explicitly (hash → its anchor, else top). pushState ONLY — a
  // same-URL replaceState is a state write and must never scroll. The shell's
  // makeSameDoorClick doors preventDefault BEFORE any push, so this listener
  // never fires for them — their behavior is untouched.
  useEffect(() => {
    const onPush = () => {
      const full = currentFullUrl();
      if (full === lastFullRef.current) {
        if (window.location.hash) scrollToHash(window.location.hash);
        else resetToTop();
      }
      lastFullRef.current = full;
    };
    window.addEventListener("pushState", onPush);
    return () => window.removeEventListener("pushState", onPush);
  }, []);

  // MECHANISM-B KILLER — the stale pop flag: arm it ONLY when the pop truly
  // changed the reactive snapshot. A pop across a duplicate same-URL entry
  // (or a query-only step) leaves the flag down — native restoration owns
  // those; the NEXT real link click must never inherit a pop it wasn't.
  useEffect(() => {
    const onPop = () => {
      if (currentPathWithHash() !== lastSeenRef.current) isPopRef.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    lastSeenRef.current = location;
    lastFullRef.current = currentFullUrl();
    const wasPop = isPopRef.current;
    isPopRef.current = false;
    const wasFirst = isFirstRef.current;
    isFirstRef.current = false;

    if (wasPop) {
      // Back/forward — defer FULLY to native scroll restoration (hash urls
      // included: a pop onto an anchor restores the user's prior position,
      // never a re-yank to the anchor — POP restores, PUSH scrolls). The
      // reused Shell scroll container cannot be natively restored and would
      // otherwise retain a stale position, so reset only the inner
      // scroll container(s).
      resetScrollRoots();
      return undefined;
    }

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
        } else if (!found && tries === 0) {
          // Pop never reaches here (the early return above) — a push toward
          // a not-yet-mounted anchor lands at the top while it mounts.
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

    // First load with no hash: don't force a jump (preserve any deep link).
    if (wasFirst) return undefined;

    resetToTop();
    return undefined;
  }, [location]);

  return null;
}
