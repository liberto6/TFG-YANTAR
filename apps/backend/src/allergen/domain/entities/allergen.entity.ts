import { AllergenCode } from '@yantar/shared'

export class Allergen {
  readonly id: string
  readonly code: AllergenCode
  readonly name: string
  readonly description: string | null
  readonly iconUrl: string | null
  readonly isMajor: boolean

  private constructor(props: {
    id: string
    code: AllergenCode
    name: string
    description: string | null
    iconUrl: string | null
    isMajor: boolean
  }) {
    this.id = props.id
    this.code = props.code
    this.name = props.name
    this.description = props.description
    this.iconUrl = props.iconUrl
    this.isMajor = props.isMajor
  }

  static restore(props: {
    id: string
    code: string
    name: string
    description: string | null
    iconUrl: string | null
    isMajor: boolean
  }): Allergen {
    return new Allergen({
      id: props.id,
      code: props.code as AllergenCode,
      name: props.name,
      description: props.description,
      iconUrl: props.iconUrl,
      isMajor: props.isMajor,
    })
  }
}
