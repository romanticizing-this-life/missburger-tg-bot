// All times are evaluated in Uzbekistan Standard Time (UTC+5).
function nowInUZT(): { h: number; m: number } {
  const d = new Date(Date.now() + 5 * 60 * 60 * 1000)
  return { h: d.getUTCHours(), m: d.getUTCMinutes() }
}

export function isDepartmentOpen(openTime: string | null | undefined, closeTime: string | null | undefined): boolean {
  if (!openTime || !closeTime) return true // null = 24/7

  const { h, m } = nowInUZT()
  const current = h * 60 + m

  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  const open = oh * 60 + om
  const close = ch * 60 + cm

  // Crosses midnight (e.g. 11:00 → 02:00)
  if (close <= open) return current >= open || current < close
  return current >= open && current < close
}

export function formatHours(openTime: string | null, closeTime: string | null): string {
  if (!openTime || !closeTime) return '24/7'
  return `${openTime} – ${closeTime}`
}
