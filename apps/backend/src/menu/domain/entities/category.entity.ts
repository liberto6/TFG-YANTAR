export class Category {
  readonly id: string
  readonly companyId: string
  readonly name: string
  readonly description: string | null
  readonly imageUrl: string | null
  readonly sortOrder: number
  readonly isActive: boolean
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: {
    id: string
    companyId: string
    name: string
    description: string | null
    imageUrl: string | null
    sortOrder: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.companyId = props.companyId
    this.name = props.name
    this.description = props.description
    this.imageUrl = props.imageUrl
    this.sortOrder = props.sortOrder
    this.isActive = props.isActive
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: {
    id: string
    companyId: string
    name: string
    description?: string | null
    imageUrl?: string | null
    sortOrder?: number
  }): Category {
    const now = new Date()
    return new Category({
      id: props.id,
      companyId: props.companyId,
      name: props.name,
      description: props.description ?? null,
      imageUrl: props.imageUrl ?? null,
      sortOrder: props.sortOrder ?? 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
  }

  static restore(props: {
    id: string
    companyId: string
    name: string
    description: string | null
    imageUrl: string | null
    sortOrder: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }): Category {
    return new Category(props)
  }

  update(changes: {
    name?: string
    description?: string | null
    imageUrl?: string | null
    sortOrder?: number
  }): Category {
    return new Category({
      id: this.id,
      companyId: this.companyId,
      name: changes.name !== undefined ? changes.name : this.name,
      description:
        changes.description !== undefined ? changes.description : this.description,
      imageUrl:
        changes.imageUrl !== undefined ? changes.imageUrl : this.imageUrl,
      sortOrder:
        changes.sortOrder !== undefined ? changes.sortOrder : this.sortOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  activate(): Category {
    return new Category({ ...this.toProps(), isActive: true, updatedAt: new Date() })
  }

  deactivate(): Category {
    return new Category({ ...this.toProps(), isActive: false, updatedAt: new Date() })
  }

  private toProps() {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      description: this.description,
      imageUrl: this.imageUrl,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
