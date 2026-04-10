import { Controller, Get } from '@nestjs/common'
import { GetAllergensService } from '../../application/services/get-allergens.service'
import { AllergenResponse } from '../../application/dtos/allergen.dto'

@Controller('allergens')
export class AllergenController {
  constructor(private readonly getAllergensService: GetAllergensService) {}

  @Get()
  async getAll(): Promise<AllergenResponse[]> {
    return this.getAllergensService.execute()
  }
}
