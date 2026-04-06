import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { IAuthService } from '../../../identity/domain/ports/auth-service.port'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

    // Try Bearer token first
    const authHeader = request.headers['authorization'] as string | undefined
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const userId = await this.authService.getUserIdFromToken(token)
      if (userId) {
        ;(request as any).userId = userId
        return true
      }
    }

    // Fall back to x-user-id header for local testing
    const userId = request.headers['x-user-id'] as string | undefined
    if (userId) {
      ;(request as any).userId = userId
      return true
    }

    throw new UnauthorizedException('Missing authentication')
  }
}
