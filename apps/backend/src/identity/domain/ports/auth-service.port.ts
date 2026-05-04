export interface JwtPayload {
  sub: string
  role: string
  companyId: string | null
}

export interface IAuthService {
  createAuthUser(email: string, password: string): Promise<string>
  issueToken(payload: JwtPayload): string
  getUserIdFromToken(token: string): Promise<string | null>
}
