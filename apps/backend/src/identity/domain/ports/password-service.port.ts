export interface IPasswordService {
  /**
   * Hashea un password en texto plano. Usar antes de persistir en BD.
   */
  hash(plaintext: string): Promise<string>

  /**
   * Verifica que un password en texto plano coincide con su hash almacenado.
   * Retorna true si coinciden, false si no.
   */
  verify(plaintext: string, hash: string): Promise<boolean>
}
