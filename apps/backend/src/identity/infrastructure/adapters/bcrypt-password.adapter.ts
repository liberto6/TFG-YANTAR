import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { IPasswordService } from '../../domain/ports/password-service.port'

const SALT_ROUNDS = 10

@Injectable()
export class BcryptPasswordAdapter implements IPasswordService {
  async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, SALT_ROUNDS)
  }

  async verify(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash)
  }
}
