/**
 * Pure domain service for allergen filtering.
 * No external dependencies — pure functions only.
 */
export class AllergenFilterService {
  /**
   * Returns only dishes that do NOT contain any of the excluded allergen codes.
   */
  filterSafeDishes<T extends { allergenCodes: string[] }>(
    dishes: T[],
    excludedCodes: string[],
  ): T[] {
    if (excludedCodes.length === 0) return dishes

    const excluded = new Set(excludedCodes)
    return dishes.filter(
      (dish) => !dish.allergenCodes.some((code) => excluded.has(code)),
    )
  }

  /**
   * Returns the unique allergen codes present across a list of dishes.
   */
  getAllergenSummary<T extends { allergenCodes: string[] }>(dishes: T[]): string[] {
    const codes = new Set<string>()
    for (const dish of dishes) {
      for (const code of dish.allergenCodes) {
        codes.add(code)
      }
    }
    return Array.from(codes).sort()
  }
}
