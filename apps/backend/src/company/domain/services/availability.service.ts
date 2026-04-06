import { OperatingHour } from '../value-objects/operating-hour.vo'
import { DeliveryZone } from '../entities/delivery-zone.entity'
import { Branch } from '../entities/branch.entity'

export class AvailabilityService {
  isOpenAt(hours: OperatingHour[], date: Date): boolean {
    const dayOfWeek = date.getDay()
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

    const todayHours = hours.filter((h) => h.dayOfWeek === dayOfWeek)
    if (todayHours.length === 0) return false

    return todayHours.some((h) => h.isOpenAt(time))
  }

  findBranchForPostalCode(
    zones: DeliveryZone[],
    postalCode: string,
  ): DeliveryZone | null {
    return zones.find((z) => z.coversPostalCode(postalCode)) ?? null
  }

  findNearestBranch(
    branches: Branch[],
    lat: number,
    lng: number,
  ): Branch | null {
    const withLocation = branches.filter((b) => b.hasLocation())
    if (withLocation.length === 0) return null

    let nearest: Branch = withLocation[0]
    let minDist = this.haversine(
      lat,
      lng,
      nearest.latitude!,
      nearest.longitude!,
    )

    for (let i = 1; i < withLocation.length; i++) {
      const branch = withLocation[i]
      const dist = this.haversine(
        lat,
        lng,
        branch.latitude!,
        branch.longitude!,
      )
      if (dist < minDist) {
        minDist = dist
        nearest = branch
      }
    }

    return nearest
  }

  private haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180
  }
}
