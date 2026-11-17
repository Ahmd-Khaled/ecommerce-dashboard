
import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (callback: () => void) => {
  const mediaQuery = window.matchMedia(MEDIA_QUERY);

  mediaQuery.addEventListener("change", callback);

  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
};

const getSnapshot = () => {
  return window.matchMedia(MEDIA_QUERY).matches;
};

const getServerSnapshot = () => false;

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}
