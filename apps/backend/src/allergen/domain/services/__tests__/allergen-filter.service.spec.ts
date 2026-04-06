import { AllergenFilterService } from '../allergen-filter.service'

const makeDish = (id: string, allergenCodes: string[]) => ({
  id,
  name: `Dish ${id}`,
  allergenCodes,
})

describe('AllergenFilterService', () => {
  let service: AllergenFilterService

  beforeEach(() => {
    service = new AllergenFilterService()
  })

  describe('filterSafeDishes', () => {
    it('should return all dishes when no allergens excluded', () => {
      const dishes = [
        makeDish('d1', ['GLUTEN', 'DAIRY']),
        makeDish('d2', ['EGGS']),
      ]
      expect(service.filterSafeDishes(dishes, [])).toHaveLength(2)
    })

    it('should exclude dishes containing excluded allergens', () => {
      const dishes = [
        makeDish('d1', ['GLUTEN', 'DAIRY']),
        makeDish('d2', ['EGGS']),
        makeDish('d3', []),
      ]
      const result = service.filterSafeDishes(dishes, ['GLUTEN'])

      expect(result).toHaveLength(2)
      expect(result.map((d) => d.id)).toEqual(['d2', 'd3'])
    })

    it('should exclude dish if it contains any of the excluded allergens', () => {
      const dishes = [
        makeDish('d1', ['GLUTEN', 'DAIRY']),
        makeDish('d2', ['DAIRY']),
        makeDish('d3', ['SOY']),
      ]
      const result = service.filterSafeDishes(dishes, ['GLUTEN', 'DAIRY'])

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('d3')
    })

    it('should return dish with no allergens as always safe', () => {
      const dishes = [makeDish('d1', [])]
      const result = service.filterSafeDishes(dishes, ['GLUTEN', 'DAIRY'])

      expect(result).toHaveLength(1)
    })
  })

  describe('getAllergenSummary', () => {
    it('should return unique allergen codes across dishes', () => {
      const dishes = [
        makeDish('d1', ['GLUTEN', 'DAIRY']),
        makeDish('d2', ['DAIRY', 'EGGS']),
        makeDish('d3', []),
      ]
      const summary = service.getAllergenSummary(dishes)

      expect(summary).toEqual(['DAIRY', 'EGGS', 'GLUTEN'])
    })

    it('should return empty array when no allergens', () => {
      const dishes = [makeDish('d1', []), makeDish('d2', [])]
      expect(service.getAllergenSummary(dishes)).toEqual([])
    })
  })
})
