"use client";

// Tells the server which time zone your device is in, so "today"
// starts and ends at YOUR midnight. It draws nothing on the screen.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TimezoneSync() {
  const router = useRouter();

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) return;

    const saved = document.cookie
      .split("; ")
      .find((part) => part.startsWith("tz="))
      ?.slice(3);
    if (saved && decodeURIComponent(saved) === timeZone) return;

    // Remember it for a year, then redraw the page with the right "today".
    document.cookie = `tz=${encodeURIComponent(timeZone)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}