export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const BRANCHES: { id: number; name: string; lat: number; lng: number }[] = [
  { id: 1, name: 'Galaba 24',  lat: 40.994032636550095, lng: 71.61047379602346 },
  { id: 2, name: 'Navoi 7/1', lat: 40.99380852342344,  lng: 71.64755283065024 },
]

export const DELIVERY_RADIUS_KM = 4
