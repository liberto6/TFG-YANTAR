export class CompanyConfigResponse {
  name!: string
  slug!: string
  description!: string | null
  logoUrl!: string | null
  faviconUrl!: string | null
  fontFamily!: string | null
  colorPrimary!: string | null
  colorSecondary!: string | null
  colorAccent!: string | null
  colorBackground!: string | null
  colorSurface!: string | null
  colorText!: string | null
  colorTextMuted!: string | null
  welcomeMessage!: string | null
  appName!: string | null

  static from(props: {
    name: string
    slug: string
    description: string | null
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
  }): CompanyConfigResponse {
    const response = new CompanyConfigResponse()
    response.name = props.name
    response.slug = props.slug
    response.description = props.description
    response.logoUrl = props.logoUrl
    response.faviconUrl = props.faviconUrl
    response.fontFamily = props.fontFamily
    response.colorPrimary = props.colorPrimary
    response.colorSecondary = props.colorSecondary
    response.colorAccent = props.colorAccent
    response.colorBackground = props.colorBackground
    response.colorSurface = props.colorSurface
    response.colorText = props.colorText
    response.colorTextMuted = props.colorTextMuted
    response.welcomeMessage = props.welcomeMessage
    response.appName = props.appName
    return response
  }
}
