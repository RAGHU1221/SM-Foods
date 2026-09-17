import { useState, useEffect, useRef } from "react";

const PREFIX = "smf-pos:";

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full / disabled (private mode) — app still works, just won't persist
  }
}

/**
 * Same shape as useState, but the value is loaded from — and saved to —
 * localStorage, so billing, cart, held bills, settings etc. all survive a
 * refresh or a full offline restart with no server involved.
 */
export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === "function" ? (initial as () => T)() : initial;
    return readLocal<T>(key, fallback);
  });
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    writeLocal(key, value);
  }, [key, value]);

  // Persist immediately on every set as well, so a hard refresh a moment
  // after a change (e.g. right after Save Bill) never loses data.
  const setAndPersist = (v: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof v === "function" ? (v as (prev: T) => T)(prev) : v;
      writeLocal(key, next);
      return next;
    });
  };

  return [value, setAndPersist] as const;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}
