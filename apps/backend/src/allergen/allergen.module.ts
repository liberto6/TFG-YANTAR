import { Module } from '@nestjs/common'
import { AllergenController } from './infrastructure/controllers/allergen.controller'
import { GetAllergensService } from './application/services/get-allergens.service'
import { PrismaAllergenRepository } from './infrastructure/repositories/prisma-allergen.repository'

@Module({
  controllers: [AllergenController],
  providers: [
    GetAllergensService,
    {
      provide: 'IAllergenRepository',
      useClass: PrismaAllergenRepository,
    },
  ],
  exports: ['IAllergenRepository', GetAllergensService],
})
export class AllergenModule {}
