import { Inject, Injectable } from '@nestjs/common'
import { ICompanyRepository } from '../../domain/ports/company-repository.port'

export interface TenantResolution {
  slug: string
  source: 'subdomain' | 'domain'
}

/**
 * Resuelve un host HTTP a una empresa Yantar:
 *   1. Si es un dominio personalizado registrado en Company.domain → devuelve su slug.
 *   2. Si es un subdominio bajo el dominio raíz de Yantar → extrae el primer segmento como slug.
 *   3. Si nada cuadra → null.
 */
@Injectable()
export class ResolveTenantService {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('YANTAR_ROOT_DOMAIN')
    private readonly rootDomain: string,
  ) {}

  async execute(rawHost: string): Promise<TenantResolution | null> {
    const host = ResolveTenantService.normalizeHost(rawHost)
    if (!host) return null

    // 1) Custom domain (incluye prefijos: pedir.napoli.es).
    const byDomain = await this.companyRepository.findByDomain(host)
    if (byDomain) {
      return { slug: byDomain.slug, source: 'domain' }
    }

    // 2) Subdominio bajo el dominio raíz: <slug>.yantar.app
    const subdomain = ResolveTenantService.extractSubdomain(host, this.rootDomain)
    if (subdomain) {
      const byRoot = await this.companyRepository.findBySlug(subdomain)
      if (byRoot) {
        return { slug: byRoot.slug, source: 'subdomain' }
      }
    }

    return null
  }

  /** Normaliza el host: minúsculas, sin puerto, sin trailing dot. */
  static normalizeHost(input: string): string {
    if (!input) return ''
    let host = input.toLowerCase().trim()
    const colonIdx = host.indexOf(':')
    if (colonIdx >= 0) host = host.substring(0, colonIdx)
    if (host.endsWith('.')) host = host.slice(0, -1)
    return host
  }

  /**
   * Extrae el primer segmento si `host` es un subdominio de `root`.
   *   ('napoli.yantar.app', 'yantar.app') → 'napoli'
   *   ('yantar.app',        'yantar.app') → null  (root, sin tenant)
   *   ('napoli.localhost',  'localhost')  → 'napoli'
   *   ('napoli.example.es', 'yantar.app') → null
   */
  static extractSubdomain(host: string, root: string): string | null {
    if (!host || !root) return null
    if (host === root) return null
    const suffix = '.' + root
    if (!host.endsWith(suffix)) return null
    const prefix = host.slice(0, -suffix.length)
    if (!prefix) return null
    // Si tiene puntos hay un sub-subdominio que no soportamos por el momento (modelo A2).
    if (prefix.includes('.')) return null
    return prefix
  }
}
