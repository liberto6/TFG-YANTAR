import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    // TODO: Replace with real JWT / session validation
    const userId = request.headers['x-user-id'] as string | undefined

    if (!userId) {
      throw new UnauthorizedException('Missing authentication')
    }

    ;(request as any).userId = userId
    return true
  }
}
