/**
 * Centralized Date & Time Formatter Utility for SkillMentor Frontend
 * Converts ISO timestamps (e.g., "2026-08-21T17:34:00") into user-friendly strings:
 * "21 Aug 2026 · 5:34 PM"
 */
export function formatSessionDateTime(dateTimeStr) {
  if (!dateTimeStr) return '—';
  
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;

    // Date part: "21 Aug 2026"
    const dateFormatted = d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Time part: "5:34 PM"
    const timeFormatted = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${dateFormatted} · ${timeFormatted}`;
  } catch (err) {
    return dateTimeStr;
  }
}
