import { AllergenCode } from '@yantar/shared'
import { Allergen } from '../entities/allergen.entity'

export interface IAllergenRepository {
  getAll(): Promise<Allergen[]>
  getByCodes(codes: AllergenCode[]): Promise<Allergen[]>
}
