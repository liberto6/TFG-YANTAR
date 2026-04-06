export class OperatingHour {
  readonly id: string
  readonly branchId: string
  readonly dayOfWeek: number
  readonly openTime: string
  readonly closeTime: string
  readonly isClosed: boolean

  private constructor(props: {
    id: string
    branchId: string
    dayOfWeek: number
    openTime: string
    closeTime: string
    isClosed: boolean
  }) {
    this.id = props.id
    this.branchId = props.branchId
    this.dayOfWeek = props.dayOfWeek
    this.openTime = props.openTime
    this.closeTime = props.closeTime
    this.isClosed = props.isClosed
  }

  static create(props: {
    id: string
    branchId: string
    dayOfWeek: number
    openTime: string
    closeTime: string
    isClosed: boolean
  }): OperatingHour {
    return new OperatingHour(props)
  }

  static restore(props: {
    id: string
    branchId: string
    dayOfWeek: number
    openTime: string
    closeTime: string
    isClosed: boolean
  }): OperatingHour {
    return new OperatingHour(props)
  }

  static forDay(
    day: number,
    openTime: string,
    closeTime: string,
  ): OperatingHour {
    return new OperatingHour({
      id: '',
      branchId: '',
      dayOfWeek: day,
      openTime,
      closeTime,
      isClosed: false,
    })
  }

  isOpenAt(time: string): boolean {
    if (this.isClosed) return false

    const check = this.timeToMinutes(time)
    const open = this.timeToMinutes(this.openTime)
    const close = this.timeToMinutes(this.closeTime)

    return check >= open && check < close
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
}
