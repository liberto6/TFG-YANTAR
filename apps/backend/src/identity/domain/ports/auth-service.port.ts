export interface IAuthService {
  createAuthUser(email: string, password: string): Promise<string>
  getUserIdFromToken(token: string): Promise<string | null>
}
