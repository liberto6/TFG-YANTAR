import { Branch } from '../entities/branch.entity'

export interface IBranchRepository {
  findById(id: string, companyId: string): Promise<Branch | null>
  findByCompanyId(companyId: string): Promise<Branch[]>
  save(branch: Branch): Promise<Branch>
  delete(id: string, companyId: string): Promise<void>
}
