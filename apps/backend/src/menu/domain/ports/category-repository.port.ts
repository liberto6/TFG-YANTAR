import { Category } from '../entities/category.entity'

export interface ICategoryRepository {
  findByCompanyId(companyId: string): Promise<Category[]>
  findById(categoryId: string, companyId: string): Promise<Category | null>
  save(category: Category): Promise<Category>
  delete(categoryId: string, companyId: string): Promise<void>
}
