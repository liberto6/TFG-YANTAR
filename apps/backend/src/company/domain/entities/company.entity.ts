export class Company {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly description: string | null
  readonly domain: string | null
  readonly logoUrl: string | null
  readonly faviconUrl: string | null
  readonly fontFamily: string | null
  readonly colorPrimary: string | null
  readonly colorSecondary: string | null
  readonly colorAccent: string | null
  readonly colorBackground: string | null
  readonly colorSurface: string | null
  readonly colorText: string | null
  readonly colorTextMuted: string | null
  readonly welcomeMessage: string | null
  readonly appName: string | null
  readonly isActive: boolean
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: {
    id: string
    name: string
    slug: string
    description: string | null
    domain: string | null
    logoUrl: string | null
    faviconUrl: string | null
    fontFamily: string | null
    colorPrimary: string | null
    colorSecondary: string | null
    colorAccent: string | null
    colorBackground: string | null
    colorSurface: string | null
    colorText: string | null
    colorTextMuted: string | null
    welcomeMessage: string | null
    appName: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.name = props.name
    this.slug = props.slug
    this.description = props.description
    this.domain = props.domain
    this.logoUrl = props.logoUrl
    this.faviconUrl = props.faviconUrl
    this.fontFamily = props.fontFamily
    this.colorPrimary = props.colorPrimary
    this.colorSecondary = props.colorSecondary
    this.colorAccent = props.colorAccent
    this.colorBackground = props.colorBackground
    this.colorSurface = props.colorSurface
    this.colorText = props.colorText
    this.colorTextMuted = props.colorTextMuted
    this.welcomeMessage = props.welcomeMessage
    this.appName = props.appName
    this.isActive = props.isActive
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: {
    id: string
    name: string
    ownerId?: string
  }): Company {
    const now = new Date()
    return new Company({
      id: props.id,
      name: props.name,
      slug: Company.generateSlug(props.name),
      description: null,
      domain: null,
      logoUrl: null,
      faviconUrl: null,
      fontFamily: null,
      colorPrimary: null,
      colorSecondary: null,
      colorAccent: null,
      colorBackground: null,
      colorSurface: null,
      colorText: null,
      colorTextMuted: null,
      welcomeMessage: null,
      appName: null,
      isActive: false,
      createdAt: now,
      updatedAt: now,
    })
  }

  static restore(props: {
    id: string
    name: string
    slug: string
    description: string | null
    domain: string | null
    logoUrl: string | null
    faviconUrl: string | null
    fontFamily: string | null
    colorPrimary: string | null
    colorSecondary: string | null
    colorAccent: string | null
    colorBackground: string | null
    colorSurface: string | null
    colorText: string | null
    colorTextMuted: string | null
    welcomeMessage: string | null
    appName: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }): Company {
    return new Company(props)
  }

  updateBranding(changes: {
    logoUrl?: string | null
    faviconUrl?: string | null
    fontFamily?: string | null
    colorPrimary?: string | null
    colorSecondary?: string | null
    colorAccent?: string | null
    colorBackground?: string | null
    colorSurface?: string | null
    colorText?: string | null
    colorTextMuted?: string | null
    welcomeMessage?: string | null
    appName?: string | null
  }): Company {
    return new Company({
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      domain: this.domain,
      logoUrl: changes.logoUrl !== undefined ? changes.logoUrl : this.logoUrl,
      faviconUrl:
        changes.faviconUrl !== undefined ? changes.faviconUrl : this.faviconUrl,
      fontFamily:
        changes.fontFamily !== undefined ? changes.fontFamily : this.fontFamily,
      colorPrimary:
        changes.colorPrimary !== undefined
          ? changes.colorPrimary
          : this.colorPrimary,
      colorSecondary:
        changes.colorSecondary !== undefined
          ? changes.colorSecondary
          : this.colorSecondary,
      colorAccent:
        changes.colorAccent !== undefined
          ? changes.colorAccent
          : this.colorAccent,
      colorBackground:
        changes.colorBackground !== undefined
          ? changes.colorBackground
          : this.colorBackground,
      colorSurface:
        changes.colorSurface !== undefined
          ? changes.colorSurface
          : this.colorSurface,
      colorText:
        changes.colorText !== undefined ? changes.colorText : this.colorText,
      colorTextMuted:
        changes.colorTextMuted !== undefined
          ? changes.colorTextMuted
          : this.colorTextMuted,
      welcomeMessage:
        changes.welcomeMessage !== undefined
          ? changes.welcomeMessage
          : this.welcomeMessage,
      appName: changes.appName !== undefined ? changes.appName : this.appName,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  updateInfo(changes: {
    name?: string
    description?: string | null
    domain?: string | null
  }): Company {
    const newName = changes.name !== undefined ? changes.name : this.name
    return new Company({
      id: this.id,
      name: newName,
      slug: changes.name !== undefined ? Company.generateSlug(newName) : this.slug,
      description:
        changes.description !== undefined
          ? changes.description
          : this.description,
      domain: changes.domain !== undefined ? changes.domain : this.domain,
      logoUrl: this.logoUrl,
      faviconUrl: this.faviconUrl,
      fontFamily: this.fontFamily,
      colorPrimary: this.colorPrimary,
      colorSecondary: this.colorSecondary,
      colorAccent: this.colorAccent,
      colorBackground: this.colorBackground,
      colorSurface: this.colorSurface,
      colorText: this.colorText,
      colorTextMuted: this.colorTextMuted,
      welcomeMessage: this.welcomeMessage,
      appName: this.appName,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  activate(): Company {
    return new Company({
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      domain: this.domain,
      logoUrl: this.logoUrl,
      faviconUrl: this.faviconUrl,
      fontFamily: this.fontFamily,
      colorPrimary: this.colorPrimary,
      colorSecondary: this.colorSecondary,
      colorAccent: this.colorAccent,
      colorBackground: this.colorBackground,
      colorSurface: this.colorSurface,
      colorText: this.colorText,
      colorTextMuted: this.colorTextMuted,
      welcomeMessage: this.welcomeMessage,
      appName: this.appName,
      isActive: true,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  deactivate(): Company {
    return new Company({
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      domain: this.domain,
      logoUrl: this.logoUrl,
      faviconUrl: this.faviconUrl,
      fontFamily: this.fontFamily,
      colorPrimary: this.colorPrimary,
      colorSecondary: this.colorSecondary,
      colorAccent: this.colorAccent,
      colorBackground: this.colorBackground,
      colorSurface: this.colorSurface,
      colorText: this.colorText,
      colorTextMuted: this.colorTextMuted,
      welcomeMessage: this.welcomeMessage,
      appName: this.appName,
      isActive: false,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  isConfigured(): boolean {
    return this.logoUrl !== null && this.colorPrimary !== null
  }

  private static generateSlug(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}
