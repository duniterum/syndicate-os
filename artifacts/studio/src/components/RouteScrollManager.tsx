import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const HEADER_OFFSET = 80;

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

function scrollToHash(hash: string): boolean {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const top = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
  );
  window.scrollTo({ top, left: 0, behavior: "auto" });
  return true;
}

/**
 * Mounted once near the router root. Keeps internal navigation landing at the
 * top of the destination (and resets the inner Shell scroll container, which
 * React reuses across Shell routes), while leaving the browser's native
 * back/forward scroll restoration alone.
 */
export function RouteScrollManager() {
  const [location] = useLocation();
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

  // Same-document hash changes (in-page anchors).
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash) {
        requestAnimationFrame(() => scrollToHash(window.location.hash));
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const wasPop = isPopRef.current;
    isPopRef.current = false;
    const wasFirst = isFirstRef.current;
    isFirstRef.current = false;

    const hash = window.location.hash;

    if (hash) {
      // Anchor navigation: jump to the target once it has rendered.
      requestAnimationFrame(() => {
        if (!scrollToHash(hash) && !wasPop) resetToTop();
      });
      return;
    }

    if (wasPop) {
      // Let the browser restore native window scroll (works for the public,
      // window-scrolled page). The reused Shell scroll container cannot be
      // natively restored and would otherwise retain a stale position, so
      // reset only the inner scroll container(s) to the top.
      resetScrollRoots();
      return;
    }

    // First load with no hash: don't force a jump (preserve any deep link).
    if (wasFirst) return;

    resetToTop();
  }, [location]);

  return null;
}
