import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { IAuthService } from '../../domain/ports/auth-service.port'

@Injectable()
export class MockAuthAdapter implements IAuthService {
  async createAuthUser(_email: string, _password: string): Promise<string> {
    return randomUUID()
  }

  async getUserIdFromToken(token: string): Promise<string | null> {
    if (token.startsWith('user-')) {
      return token
    }
    return null
  }
}
