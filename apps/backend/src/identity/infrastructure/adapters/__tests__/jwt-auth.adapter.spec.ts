import { JwtAuthAdapter } from '../jwt-auth.adapter'
import { UserRole } from '@yantar/shared'

describe('JwtAuthAdapter', () => {
  let adapter: JwtAuthAdapter

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-with-enough-entropy'
    process.env.JWT_EXPIRY_SECONDS = '3600'
    adapter = new JwtAuthAdapter()
  })

  afterEach(() => {
    delete process.env.JWT_SECRET
    delete process.env.JWT_EXPIRY_SECONDS
  })

  describe('createAuthUser', () => {
    it('debería retornar un UUID v4 valido', async () => {
      const id = await adapter.createAuthUser('a@b.com', 'password')
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('debería retornar un UUID distinto en cada invocación', async () => {
      const a = await adapter.createAuthUser('a@b.com', 'p')
      const b = await adapter.createAuthUser('a@b.com', 'p')
      expect(a).not.toBe(b)
    })
  })

  describe('issueToken', () => {
    it('debería emitir un JWT con tres segmentos separados por puntos', () => {
      const token = adapter.issueToken({
        sub: 'user-1',
        role: UserRole.RESTAURANT_ADMIN,
        companyId: 'company-1',
      })
      expect(token.split('.')).toHaveLength(3)
    })

    it('el header debería declarar HS256 y typ JWT', () => {
      const token = adapter.issueToken({
        sub: 'user-1',
        role: UserRole.CUSTOMER,
        companyId: null,
      })
      const [headerB64] = token.split('.')
      const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf-8'))
      expect(header).toEqual({ alg: 'HS256', typ: 'JWT' })
    })

    it('el payload debería contener sub, role, companyId, iat y exp', () => {
      const before = Math.floor(Date.now() / 1000)
      const token = adapter.issueToken({
        sub: 'user-1',
        role: UserRole.RESTAURANT_ADMIN,
        companyId: 'company-1',
      })
      const after = Math.floor(Date.now() / 1000)

      const [, claimsB64] = token.split('.')
      const claims = JSON.parse(Buffer.from(claimsB64, 'base64url').toString('utf-8'))

      expect(claims.sub).toBe('user-1')
      expect(claims.role).toBe(UserRole.RESTAURANT_ADMIN)
      expect(claims.companyId).toBe('company-1')
      expect(claims.iat).toBeGreaterThanOrEqual(before)
      expect(claims.iat).toBeLessThanOrEqual(after)
      expect(claims.exp).toBe(claims.iat + 3600)
    })
  })

  describe('getUserIdFromToken', () => {
    it('debería retornar el sub de un token recien emitido', async () => {
      const token = adapter.issueToken({
        sub: 'user-42',
        role: UserRole.CUSTOMER,
        companyId: 'company-1',
      })
      await expect(adapter.getUserIdFromToken(token)).resolves.toBe('user-42')
    })

    it('debería retornar null para un token vacío', async () => {
      await expect(adapter.getUserIdFromToken('')).resolves.toBeNull()
    })

    it('debería retornar null si el token no tiene tres segmentos', async () => {
      await expect(adapter.getUserIdFromToken('only.two')).resolves.toBeNull()
      await expect(adapter.getUserIdFromToken('a.b.c.d')).resolves.toBeNull()
    })

    it('debería retornar null si la firma fue alterada', async () => {
      const valid = adapter.issueToken({
        sub: 'user-1',
        role: UserRole.CUSTOMER,
        companyId: null,
      })
      const [h, p] = valid.split('.')
      const tampered = `${h}.${p}.signaturalsa`
      await expect(adapter.getUserIdFromToken(tampered)).resolves.toBeNull()
    })

    it('debería retornar null si el payload fue alterado (firma deja de coincidir)', async () => {
      const valid = adapter.issueToken({
        sub: 'user-1',
        role: UserRole.CUSTOMER,
        companyId: null,
      })
      const [h, , s] = valid.split('.')
      const fakePayload = Buffer.from(JSON.stringify({ sub: 'attacker' })).toString('base64url')
      const tampered = `${h}.${fakePayload}.${s}`
      await expect(adapter.getUserIdFromToken(tampered)).resolves.toBeNull()
    })

    it('debería retornar null si el token esta expirado', async () => {
      process.env.JWT_EXPIRY_SECONDS = '-10' // emite ya expirado
      const expiredAdapter = new JwtAuthAdapter()
      const token = expiredAdapter.issueToken({
        sub: 'user-1',
        role: UserRole.CUSTOMER,
        companyId: null,
      })
      await expect(expiredAdapter.getUserIdFromToken(token)).resolves.toBeNull()
    })

    it('debería retornar null si el token fue firmado con otro secreto', async () => {
      const token = adapter.issueToken({
        sub: 'user-1',
        role: UserRole.CUSTOMER,
        companyId: null,
      })
      process.env.JWT_SECRET = 'otro-secreto-distinto'
      const otherAdapter = new JwtAuthAdapter()
      await expect(otherAdapter.getUserIdFromToken(token)).resolves.toBeNull()
    })
  })
})
