import { Category } from '../category.entity'

describe('Category', () => {
  const defaultProps = {
    id: 'cat-1',
    companyId: 'company-1',
    name: 'Entrantes',
  }

  describe('create', () => {
    it('should create with defaults', () => {
      const category = Category.create(defaultProps)

      expect(category.id).toBe('cat-1')
      expect(category.companyId).toBe('company-1')
      expect(category.name).toBe('Entrantes')
      expect(category.description).toBeNull()
      expect(category.imageUrl).toBeNull()
      expect(category.sortOrder).toBe(0)
      expect(category.isActive).toBe(true)
    })

    it('should create with optional fields', () => {
      const category = Category.create({
        ...defaultProps,
        description: 'Para empezar',
        imageUrl: 'https://cdn.example.com/entrantes.jpg',
        sortOrder: 2,
      })

      expect(category.description).toBe('Para empezar')
      expect(category.imageUrl).toBe('https://cdn.example.com/entrantes.jpg')
      expect(category.sortOrder).toBe(2)
    })
  })

  describe('update', () => {
    it('should return a new instance with updated fields', () => {
      const category = Category.create(defaultProps)
      const updated = category.update({ name: 'Primeros', sortOrder: 1 })

      expect(updated).not.toBe(category)
      expect(updated.name).toBe('Primeros')
      expect(updated.sortOrder).toBe(1)
      expect(updated.companyId).toBe('company-1')
    })

    it('should preserve unchanged fields', () => {
      const category = Category.create({ ...defaultProps, description: 'Desc' })
      const updated = category.update({ name: 'Nuevo nombre' })

      expect(updated.description).toBe('Desc')
    })
  })

  describe('activate / deactivate', () => {
    it('should deactivate an active category', () => {
      const category = Category.create(defaultProps)
      const deactivated = category.deactivate()

      expect(deactivated.isActive).toBe(false)
      expect(deactivated).not.toBe(category)
    })

    it('should activate a deactivated category', () => {
      const category = Category.create(defaultProps)
      const deactivated = category.deactivate()
      const reactivated = deactivated.activate()

      expect(reactivated.isActive).toBe(true)
    })
  })

  describe('restore', () => {
    it('should reconstitute all fields', () => {
      const now = new Date()
      const category = Category.restore({
        id: 'cat-1',
        companyId: 'company-1',
        name: 'Postres',
        description: 'Dulces',
        imageUrl: null,
        sortOrder: 3,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      })

      expect(category.name).toBe('Postres')
      expect(category.isActive).toBe(false)
      expect(category.sortOrder).toBe(3)
    })
  })
})
