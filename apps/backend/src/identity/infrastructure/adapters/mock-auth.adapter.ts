import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { IAuthService } from '../../domain/ports/auth-service.port'

@Injectable()
export class MockAuthAdapter implements IAuthService {
  async createAuthUser(_email: string, _password: string): Promise<string> {
    return randomUUID()
  }

  async getUserIdFromToken(token: string): Promise<string | null> {
    // Mock: token IS the userId (UUID stored in localStorage after register/login)
    if (token && token.length > 0) {
      return token
    }
    return null
  }
}
