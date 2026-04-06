import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { Category } from '../../domain/entities/category.entity'
import { ICategoryRepository } from '../../domain/ports/category-repository.port'

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompanyId(companyId: string): Promise<Category[]> {
    const records = await this.prisma.category.findMany({
      where: { companyId },
      orderBy: { sortOrder: 'asc' },
    })
    return records.map((r) => this.toDomain(r))
  }

  async findById(categoryId: string, companyId: string): Promise<Category | null> {
    const record = await this.prisma.category.findFirst({
      where: { id: categoryId, companyId },
    })
    return record ? this.toDomain(record) : null
  }

  async save(category: Category): Promise<Category> {
    const data = this.toPrisma(category)
    const record = await this.prisma.category.upsert({
      where: { id: category.id },
      create: data,
      update: data,
    })
    return this.toDomain(record)
  }

  async delete(categoryId: string, companyId: string): Promise<void> {
    await this.prisma.category.deleteMany({
      where: { id: categoryId, companyId },
    })
  }

  private toDomain(record: {
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
    return Category.restore({
      id: record.id,
      companyId: record.companyId,
      name: record.name,
      description: record.description,
      imageUrl: record.imageUrl,
      sortOrder: record.sortOrder,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }

  private toPrisma(category: Category) {
    return {
      id: category.id,
      companyId: category.companyId,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }
  }
}
