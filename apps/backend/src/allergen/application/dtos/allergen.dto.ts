import { AllergenCode } from '@yantar/shared'
import { Allergen } from '../../domain/entities/allergen.entity'

export class AllergenResponse {
  id!: string
  code!: AllergenCode
  name!: string
  description!: string | null
  iconUrl!: string | null
  isMajor!: boolean

  static fromEntity(allergen: Allergen): AllergenResponse {
    const dto = new AllergenResponse()
    dto.id = allergen.id
    dto.code = allergen.code
    dto.name = allergen.name
    dto.description = allergen.description
    dto.iconUrl = allergen.iconUrl
    dto.isMajor = allergen.isMajor
    return dto
  }
}
