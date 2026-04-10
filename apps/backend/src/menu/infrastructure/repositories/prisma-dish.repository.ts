import { Injectable } from '@nestjs/common'
import { DishStatus } from '@yantar/shared'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { Dish } from '../../domain/entities/dish.entity'
import { VariantGroup, VariantOption } from '../../domain/entities/variant-group.entity'
import {
  ModifierGroup,
  ModifierOption,
  SelectionType,
} from '../../domain/entities/modifier-group.entity'
import { IDishRepository } from '../../domain/ports/dish-repository.port'

type PrismaVariantOption = {
  id: string
  variantGroupId: string
  name: string
  priceAdjustment: number
  sortOrder: number
}

type PrismaVariantGroup = {
  id: string
  dishId: string
  name: string
  required: boolean
  sortOrder: number
  options: PrismaVariantOption[]
}

type PrismaModifierOption = {
  id: string
  modifierGroupId: string
  name: string
  extraPrice: number
  sortOrder: number
}

type PrismaModifierGroup = {
  id: string
  dishId: string
  name: string
  required: boolean
  selectionType: string
  minSelections: number
  maxSelections: number | null
  sortOrder: number
  options: PrismaModifierOption[]
}

type PrismaDishRecord = {
  id: string
  companyId: string
  categoryId: string
  name: string
  description: string | null
  basePrice: number
  imageUrl: string | null
  status: string
  sortOrder: number
  allergenCodes: { allergenCode: string }[]
  variantGroups: PrismaVariantGroup[]
  modifierGroups: PrismaModifierGroup[]
  createdAt: Date
  updatedAt: Date
}

const DISH_INCLUDE = {
  allergenCodes: true,
  variantGroups: {
    include: { options: { orderBy: { sortOrder: 'asc' as const } } },
    orderBy: { sortOrder: 'asc' as const },
  },
  modifierGroups: {
    include: { options: { orderBy: { sortOrder: 'asc' as const } } },
    orderBy: { sortOrder: 'asc' as const },
  },
}

@Injectable()
export class PrismaDishRepository implements IDishRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCompanyId(
    companyId: string,
    filters?: { categoryId?: string; status?: DishStatus },
  ): Promise<Dish[]> {
    const records = await this.prisma.dish.findMany({
      where: {
        companyId,
        ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      include: DISH_INCLUDE,
      orderBy: { sortOrder: 'asc' },
    })
    return records.map((r) => this.toDomain(r as unknown as PrismaDishRecord))
  }

  async findById(dishId: string, companyId: string): Promise<Dish | null> {
    const record = await this.prisma.dish.findFirst({
      where: { id: dishId, companyId },
      include: DISH_INCLUDE,
    })
    return record ? this.toDomain(record as unknown as PrismaDishRecord) : null
  }

  async findByIds(dishIds: string[], companyId: string): Promise<Dish[]> {
    const records = await this.prisma.dish.findMany({
      where: { id: { in: dishIds }, companyId },
      include: DISH_INCLUDE,
    })
    return records.map((r) => this.toDomain(r as unknown as PrismaDishRecord))
  }

  async save(dish: Dish): Promise<Dish> {
    const record = await this.prisma.$transaction(async (tx) => {
      // Upsert base dish (no nested relations)
      await tx.dish.upsert({
        where: { id: dish.id },
        create: {
          id: dish.id,
          companyId: dish.companyId,
          categoryId: dish.categoryId,
          name: dish.name,
          description: dish.description,
          basePrice: dish.basePrice,
          imageUrl: dish.imageUrl,
          status: dish.status,
          sortOrder: dish.sortOrder,
          createdAt: dish.createdAt,
          updatedAt: dish.updatedAt,
        },
        update: {
          categoryId: dish.categoryId,
          name: dish.name,
          description: dish.description,
          basePrice: dish.basePrice,
          imageUrl: dish.imageUrl,
          status: dish.status,
          sortOrder: dish.sortOrder,
          updatedAt: dish.updatedAt,
        },
      })

      // Replace allergen codes
      await tx.dishAllergen.deleteMany({ where: { dishId: dish.id } })
      if (dish.allergenCodes.length > 0) {
        await tx.dishAllergen.createMany({
          data: dish.allergenCodes.map((code) => ({
            id: `${dish.id}-${code}`,
            dishId: dish.id,
            allergenCode: code,
          })),
        })
      }

      // Replace variant groups (cascade deletes options)
      await tx.variantGroup.deleteMany({ where: { dishId: dish.id } })
      for (const vg of dish.variantGroups) {
        await tx.variantGroup.create({
          data: {
            id: vg.id,
            dishId: dish.id,
            name: vg.name,
            required: vg.required,
            sortOrder: vg.sortOrder,
            options: {
              create: vg.options.map((o) => ({
                id: o.id,
                name: o.name,
                priceAdjustment: o.priceAdjustment,
                sortOrder: o.sortOrder,
              })),
            },
          },
        })
      }

      // Replace modifier groups (cascade deletes options)
      await tx.modifierGroup.deleteMany({ where: { dishId: dish.id } })
      for (const mg of dish.modifierGroups) {
        await tx.modifierGroup.create({
          data: {
            id: mg.id,
            dishId: dish.id,
            name: mg.name,
            required: mg.required,
            selectionType: mg.selectionType,
            minSelections: mg.minSelections,
            maxSelections: mg.maxSelections,
            sortOrder: mg.sortOrder,
            options: {
              create: mg.options.map((o) => ({
                id: o.id,
                name: o.name,
                extraPrice: o.extraPrice,
                sortOrder: o.sortOrder,
              })),
            },
          },
        })
      }

      return tx.dish.findFirstOrThrow({
        where: { id: dish.id },
        include: DISH_INCLUDE,
      })
    })

    return this.toDomain(record as unknown as PrismaDishRecord)
  }

  async delete(dishId: string, companyId: string): Promise<void> {
    await this.prisma.dish.deleteMany({
      where: { id: dishId, companyId },
    })
  }

  private toDomain(record: PrismaDishRecord): Dish {
    return Dish.restore({
      id: record.id,
      companyId: record.companyId,
      categoryId: record.categoryId,
      name: record.name,
      description: record.description,
      basePrice: record.basePrice,
      imageUrl: record.imageUrl,
      status: record.status as DishStatus,
      sortOrder: record.sortOrder,
      allergenCodes: record.allergenCodes.map((a) => a.allergenCode),
      variantGroups: record.variantGroups.map(
        (vg) =>
          new VariantGroup({
            id: vg.id,
            dishId: vg.dishId,
            name: vg.name,
            required: vg.required,
            sortOrder: vg.sortOrder,
            options: vg.options.map(
              (o) =>
                new VariantOption({
                  id: o.id,
                  variantGroupId: o.variantGroupId,
                  name: o.name,
                  priceAdjustment: o.priceAdjustment,
                  sortOrder: o.sortOrder,
                }),
            ),
          }),
      ),
      modifierGroups: record.modifierGroups.map(
        (mg) =>
          new ModifierGroup({
            id: mg.id,
            dishId: mg.dishId,
            name: mg.name,
            required: mg.required,
            selectionType: mg.selectionType as SelectionType,
            minSelections: mg.minSelections,
            maxSelections: mg.maxSelections,
            sortOrder: mg.sortOrder,
            options: mg.options.map(
              (o) =>
                new ModifierOption({
                  id: o.id,
                  modifierGroupId: o.modifierGroupId,
                  name: o.name,
                  extraPrice: o.extraPrice,
                  sortOrder: o.sortOrder,
                }),
            ),
          }),
      ),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }
}
