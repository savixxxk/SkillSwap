/** Match server: feedback allowed after `time` + duration (default 60 min). */
export function sessionEnded(s, now = Date.now()) {
  const start = new Date(s.time).getTime();
  const mins = s.durationMinutes ?? 60;
  return now > start + mins * 60 * 1000;
}

/** Compare calendar day in local timezone (avoids UTC vs local mismatches). */
export function sameLocalCalendarDay(isoOrDate, dayDate) {
  const d = new Date(isoOrDate);
  return (
    d.getFullYear() === dayDate.getFullYear() &&
    d.getMonth() === dayDate.getMonth() &&
    d.getDate() === dayDate.getDate()
  );
}
