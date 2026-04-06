import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common'
import { Request } from 'express'
import { IUserRepository } from '../../../identity/domain/ports/user-repository.port'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const userId = (request as any).userId as string | undefined
    if (!userId) return false

    const user = await this.userRepo.findById(userId)
    if (!user) return false

    return user.isAdmin() || user.isSuperadmin()
  }
}
