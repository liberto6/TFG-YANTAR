import { ServiceMode } from '../value-objects/service-mode.enum'

export class Branch {
  readonly id: string
  readonly companyId: string
  readonly name: string
  readonly address: string
  readonly serviceModes: ServiceMode[]
  readonly isActive: boolean
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: {
    id: string
    companyId: string
    name: string
    address: string
    serviceModes: ServiceMode[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.companyId = props.companyId
    this.name = props.name
    this.address = props.address
    this.serviceModes = props.serviceModes
    this.isActive = props.isActive
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  supportsDelivery(): boolean {
    return this.serviceModes.includes(ServiceMode.DELIVERY)
  }

  supportsPickup(): boolean {
    return this.serviceModes.includes(ServiceMode.PICKUP)
  }
}
