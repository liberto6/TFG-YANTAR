import { Injectable } from '@nestjs/common'
import { createHmac, randomUUID } from 'crypto'
import { IAuthService, JwtPayload } from '../../domain/ports/auth-service.port'

/**
 * JWT (HS256) implementation of IAuthService.
 *
 * The token is a standard JWT signed with HMAC-SHA256 using the secret in
 * `JWT_SECRET`. It is composed of three base64url-encoded parts joined by
 * dots: header.payload.signature. The payload includes the standard
 * `sub`, `iat`, `exp` claims plus `role` and `companyId` for downstream
 * authorization.
 */
@Injectable()
export class JwtAuthAdapter implements IAuthService {
  private readonly secret: string
  private readonly expirySeconds: number

  constructor() {
    this.secret =
      process.env.JWT_SECRET ??
      'yantar-development-secret-do-not-use-in-production'
    this.expirySeconds = parseInt(process.env.JWT_EXPIRY_SECONDS ?? '86400', 10)
  }

  /**
   * Returns a fresh UUID to be used as the User's primary key. The actual
   * authentication credential (password) is verified and stored elsewhere
   * (BcryptPasswordAdapter), so this adapter does not handle it.
   */
  async createAuthUser(_email: string, _password: string): Promise<string> {
    return randomUUID()
  }

  issueToken(payload: JwtPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' }
    const now = Math.floor(Date.now() / 1000)
    const claims = {
      ...payload,
      iat: now,
      exp: now + this.expirySeconds,
    }
    const headerB64 = JwtAuthAdapter.base64url(JSON.stringify(header))
    const claimsB64 = JwtAuthAdapter.base64url(JSON.stringify(claims))
    const signature = this.sign(`${headerB64}.${claimsB64}`)
    return `${headerB64}.${claimsB64}.${signature}`
  }

  async getUserIdFromToken(token: string): Promise<string | null> {
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, claimsB64, signature] = parts
    const expected = this.sign(`${headerB64}.${claimsB64}`)
    if (!JwtAuthAdapter.constantTimeEqual(signature, expected)) return null

    let claims: { sub?: unknown; exp?: unknown }
    try {
      claims = JSON.parse(
        Buffer.from(claimsB64, 'base64url').toString('utf-8'),
      )
    } catch {
      return null
    }

    const now = Math.floor(Date.now() / 1000)
    if (typeof claims.exp === 'number' && claims.exp < now) return null
    return typeof claims.sub === 'string' ? claims.sub : null
  }

  private sign(data: string): string {
    return createHmac('sha256', this.secret).update(data).digest('base64url')
  }

  private static base64url(data: string): string {
    return Buffer.from(data, 'utf-8').toString('base64url')
  }

  /** Constant-time comparison to avoid timing attacks on the signature. */
  private static constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
  }
}
