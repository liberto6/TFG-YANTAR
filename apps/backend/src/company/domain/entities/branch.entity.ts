import { ServiceMode } from '@yantar/shared'

export class Branch {
  readonly id: string
  readonly companyId: string
  readonly name: string
  readonly address: string
  readonly phone: string | null
  readonly email: string | null
  readonly latitude: number | null
  readonly longitude: number | null
  readonly serviceModes: ServiceMode[]
  readonly isActive: boolean
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: {
    id: string
    companyId: string
    name: string
    address: string
    phone: string | null
    email: string | null
    latitude: number | null
    longitude: number | null
    serviceModes: ServiceMode[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.companyId = props.companyId
    this.name = props.name
    this.address = props.address
    this.phone = props.phone
    this.email = props.email
    this.latitude = props.latitude
    this.longitude = props.longitude
    this.serviceModes = props.serviceModes
    this.isActive = props.isActive
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: {
    id: string
    companyId: string
    name: string
    address: string
    phone?: string | null
    email?: string | null
    latitude?: number | null
    longitude?: number | null
    serviceModes: ServiceMode[]
  }): Branch {
    const now = new Date()
    return new Branch({
      id: props.id,
      companyId: props.companyId,
      name: props.name,
      address: props.address,
      phone: props.phone ?? null,
      email: props.email ?? null,
      latitude: props.latitude ?? null,
      longitude: props.longitude ?? null,
      serviceModes: props.serviceModes,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
  }

  static restore(props: {
    id: string
    companyId: string
    name: string
    address: string
    phone: string | null
    email: string | null
    latitude: number | null
    longitude: number | null
    serviceModes: ServiceMode[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }): Branch {
    return new Branch(props)
  }

  supportsDelivery(): boolean {
    return this.serviceModes.includes(ServiceMode.DELIVERY)
  }

  supportsPickup(): boolean {
    return this.serviceModes.includes(ServiceMode.PICKUP)
  }

  hasLocation(): boolean {
    return this.latitude !== null && this.longitude !== null
  }

  activate(): Branch {
    return new Branch({
      ...this.toProps(),
      isActive: true,
      updatedAt: new Date(),
    })
  }

  deactivate(): Branch {
    return new Branch({
      ...this.toProps(),
      isActive: false,
      updatedAt: new Date(),
    })
  }

  update(changes: {
    name?: string
    address?: string
    phone?: string | null
    email?: string | null
    latitude?: number | null
    longitude?: number | null
    serviceModes?: ServiceMode[]
  }): Branch {
    return new Branch({
      id: this.id,
      companyId: this.companyId,
      name: changes.name !== undefined ? changes.name : this.name,
      address: changes.address !== undefined ? changes.address : this.address,
      phone: changes.phone !== undefined ? changes.phone : this.phone,
      email: changes.email !== undefined ? changes.email : this.email,
      latitude:
        changes.latitude !== undefined ? changes.latitude : this.latitude,
      longitude:
        changes.longitude !== undefined ? changes.longitude : this.longitude,
      serviceModes:
        changes.serviceModes !== undefined
          ? changes.serviceModes
          : this.serviceModes,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  private toProps() {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      address: this.address,
      phone: this.phone,
      email: this.email,
      latitude: this.latitude,
      longitude: this.longitude,
      serviceModes: this.serviceModes,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
