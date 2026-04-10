import { Inject, Injectable } from '@nestjs/common'
import { IAllergenRepository } from '../../domain/ports/allergen-repository.port'
import { AllergenResponse } from '../dtos/allergen.dto'

@Injectable()
export class GetAllergensService {
  constructor(
    @Inject('IAllergenRepository')
    private readonly allergenRepository: IAllergenRepository,
  ) {}

  async execute(): Promise<AllergenResponse[]> {
    const allergens = await this.allergenRepository.getAll()
    return allergens.map(AllergenResponse.fromEntity)
  }
}
