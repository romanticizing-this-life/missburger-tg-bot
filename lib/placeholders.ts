// Department-level placeholder styles shown when an item has no image_url.
// Replace with real photo once uploaded via admin panel.
type PlaceholderStyle = { emoji: string; from: string; to: string }

const STYLES: Record<string, PlaceholderStyle> = {
  burger:   { emoji: '🍔', from: '#4a1a00', to: '#8B0000' },
  pizza:    { emoji: '🍕', from: '#4a2500', to: '#c2410c' },
  sushi:    { emoji: '🍣', from: '#0f172a', to: '#1e293b' },
  drinks:   { emoji: '🥤', from: '#0c1a3a', to: '#1e3a5f' },
  gelato:   { emoji: '🍦', from: '#3b0764', to: '#6b21a8' },
  shashlik: { emoji: '🍖', from: '#450a0a', to: '#7f1d1d' },
  kfc:      { emoji: '🍗', from: '#431407', to: '#9a3412' },
  donar:    { emoji: '🌯', from: '#3f3800', to: '#78350f' },
  lavash:   { emoji: '🫓', from: '#292524', to: '#44403c' },
  fastfood: { emoji: '🍟', from: '#422006', to: '#854d0e' },
  fish:     { emoji: '🐟', from: '#082f49', to: '#0c4a6e' },
  kamelot:  { emoji: '🍲', from: '#450a0a', to: '#c2410c' },
}

const DEFAULT: PlaceholderStyle = { emoji: '🍽️', from: '#1a1a1a', to: '#2a2a2a' }

export function getPlaceholder(departmentSlug: string): PlaceholderStyle {
  return STYLES[departmentSlug] ?? DEFAULT
}
