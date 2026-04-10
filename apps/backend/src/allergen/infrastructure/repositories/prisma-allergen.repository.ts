import { Injectable } from '@nestjs/common'
import { AllergenCode } from '@yantar/shared'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { Allergen } from '../../domain/entities/allergen.entity'
import { IAllergenRepository } from '../../domain/ports/allergen-repository.port'

@Injectable()
export class PrismaAllergenRepository implements IAllergenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Allergen[]> {
    const records = await this.prisma.allergen.findMany({
      orderBy: { code: 'asc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async getByCodes(codes: AllergenCode[]): Promise<Allergen[]> {
    const records = await this.prisma.allergen.findMany({
      where: { code: { in: codes } },
    })
    return records.map((r) => this.toDomain(r))
  }

  private toDomain(record: {
    id: string
    code: string
    name: string
    description: string | null
    iconUrl: string | null
    isMajor: boolean
  }): Allergen {
    return Allergen.restore(record)
  }
}
