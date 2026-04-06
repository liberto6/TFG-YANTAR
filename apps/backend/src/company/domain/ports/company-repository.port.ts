import { Company } from '../entities/company.entity'

export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>
  findBySlug(slug: string): Promise<Company | null>
  save(company: Company): Promise<Company>
}
