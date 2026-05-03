import { Injectable, Inject } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { IUserRepository } from '../../domain/ports/user-repository.port'
import { IAuthService } from '../../domain/ports/auth-service.port'
import { ICompanyRepository } from '../../../company/domain/ports/company-repository.port'
import { User } from '../../domain/entities/user.entity'
import { Company } from '../../../company/domain/entities/company.entity'
import { UserDto } from '../dtos/user.dto'
import {
  RegisterBusinessRequest,
  RegisterBusinessResponse,
} from '../dtos/register-business.dto'

@Injectable()
export class RegisterBusinessService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuthService')
    private readonly authService: IAuthService,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(
    request: RegisterBusinessRequest,
  ): Promise<RegisterBusinessResponse> {
    const userId = await this.authService.createAuthUser(
      request.email,
      request.password,
    )

    const company = Company.create({
      id: randomUUID(),
      name: request.companyName,
    }).activate()
    const savedCompany = await this.companyRepository.save(company)

    const user = User.createAdmin({
      id: userId,
      email: request.email,
      displayName: request.displayName,
      phone: request.phone,
      companyId: savedCompany.id,
    })
    const savedUser = await this.userRepository.save(user)

    const response = new RegisterBusinessResponse()
    response.user = UserDto.fromEntity(savedUser)
    response.company = {
      id: savedCompany.id,
      name: savedCompany.name,
      slug: savedCompany.slug,
    }
    return response
  }
}
