// src/utils/date.ts
export function formatRelativeTimeWithTooltip(dateStr: string | Date) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return { display: "", full: "" };

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  let display = "";
  if (Math.abs(seconds) < 60) display = rtf.format(-seconds, "second");
  else if (Math.abs(minutes) < 60) display = rtf.format(-minutes, "minute");
  else if (Math.abs(hours) < 24) display = rtf.format(-hours, "hour");
  else display = rtf.format(-days, "day");

  return {
    display,
    full: date.toLocaleString(),
  };
}
