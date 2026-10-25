// Which time zone is this player in?
// The browser saves it in a small cookie (see app/TimezoneSync.tsx),
// and this reads it back on the server. If it is missing or odd, we use UTC.

import { cookies } from "next/headers";

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export async function getTimeZone(): Promise<string> {
  const raw = (await cookies()).get("tz")?.value;
  if (!raw) return "UTC";

  try {
    const timeZone = decodeURIComponent(raw);
    return isValidTimeZone(timeZone) ? timeZone : "UTC";
  } catch {
    return "UTC";
  }
}

