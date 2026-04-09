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

  generateTimeSlots(
    hours: OperatingHour[],
    targetDate: Date,
    now: Date,
    intervalMinutes: number,
  ): { label: string; value: string }[] {
    const dayOfWeek = targetDate.getDay()
    const dayHours = hours.filter((h) => h.dayOfWeek === dayOfWeek && !h.isClosed)
    if (dayHours.length === 0) return []

    const isToday =
      targetDate.getFullYear() === now.getFullYear() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getDate() === now.getDate()

    const minMinutesFromNow = now.getHours() * 60 + now.getMinutes() + intervalMinutes

    const slots: { label: string; value: string }[] = []

    for (const period of dayHours) {
      const open = this.timeToMinutes(period.openTime)
      const close = this.timeToMinutes(period.closeTime)

      let current = open
      while (current + intervalMinutes <= close) {
        if (!isToday || current >= minMinutesFromNow) {
          const h = Math.floor(current / 60)
          const m = current % 60
          const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
          const value = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
            h,
            m,
          ).toISOString()
          slots.push({ label, value })
        }
        current += intervalMinutes
      }
    }

    return slots
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
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
