import { ManageCategoriesService } from '../manage-categories.service'
import { Category } from '../../../domain/entities/category.entity'
import { CategoryNotFoundError } from '../../../domain/errors/category-not-found.error'

const mockCategoryRepository = {
  findByCompanyId: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('ManageCategoriesService', () => {
  let service: ManageCategoriesService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ManageCategoriesService(mockCategoryRepository)
  })

  describe('listCategories', () => {
    it('should return all categories for a company', async () => {
      const categories = [
        Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Entrantes' }),
        Category.create({ id: 'cat-2', companyId: 'co-1', name: 'Postres' }),
      ]
      mockCategoryRepository.findByCompanyId.mockResolvedValue(categories)

      const result = await service.listCategories('co-1')

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Entrantes')
      expect(result[1].name).toBe('Postres')
    })
  })

  describe('createCategory', () => {
    it('should create and save a category', async () => {
      mockCategoryRepository.save.mockImplementation(async (c: Category) => c)

      const result = await service.createCategory('co-1', {
        name: 'Bebidas',
        description: 'Refrescos y más',
        sortOrder: 3,
      })

      expect(result.name).toBe('Bebidas')
      expect(result.companyId).toBe('co-1')
      expect(result.description).toBe('Refrescos y más')
      expect(result.sortOrder).toBe(3)
      expect(mockCategoryRepository.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const existing = Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Entrantes' })
      mockCategoryRepository.findById.mockResolvedValue(existing)
      mockCategoryRepository.save.mockImplementation(async (c: Category) => c)

      const result = await service.updateCategory('co-1', 'cat-1', { name: 'Primeros' })

      expect(result.name).toBe('Primeros')
    })

    it('should deactivate when isActive is false', async () => {
      const existing = Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Postres' })
      mockCategoryRepository.findById.mockResolvedValue(existing)
      mockCategoryRepository.save.mockImplementation(async (c: Category) => c)

      const result = await service.updateCategory('co-1', 'cat-1', { isActive: false })

      expect(result.isActive).toBe(false)
    })

    it('should throw CategoryNotFoundError when not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null)

      await expect(
        service.updateCategory('co-1', 'non-existent', { name: 'X' }),
      ).rejects.toThrow(CategoryNotFoundError)
    })
  })

  describe('deleteCategory', () => {
    it('should delete an existing category', async () => {
      const existing = Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Entrantes' })
      mockCategoryRepository.findById.mockResolvedValue(existing)
      mockCategoryRepository.delete.mockResolvedValue(undefined)

      await service.deleteCategory('co-1', 'cat-1')

      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('cat-1', 'co-1')
    })

    it('should throw CategoryNotFoundError when not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null)

      await expect(
        service.deleteCategory('co-1', 'non-existent'),
      ).rejects.toThrow(CategoryNotFoundError)
    })
  })
})
