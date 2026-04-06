export class Company {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly ownerId: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: {
    id: string
    name: string
    slug: string
    ownerId: string
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.name = props.name
    this.slug = props.slug
    this.ownerId = props.ownerId
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId
  }
}
