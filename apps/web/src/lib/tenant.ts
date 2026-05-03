import { headers } from "next/headers";

const SLUG_HEADER = "x-yantar-slug";

/**
 * Devuelve el slug del tenant resuelto por el middleware en runtime a partir
 * del Host de la petición. Si no hay tenant (acceso al dominio raíz del SaaS,
 * p.\,ej.\ `yantar.app` o `localhost:3000` plano), devuelve null.
 *
 * Solo seguro en Server Components / Route Handlers (depende de `headers()`).
 */
export function getTenantSlug(): string | null {
  return headers().get(SLUG_HEADER);
}

/**
 * Variante que lanza si no hay slug. Para páginas que requieren tenant
 * (todo lo que está bajo (customer), (admin), (operativo)).
 */
export function requireTenantSlug(): string {
  const slug = getTenantSlug();
  if (!slug) {
    throw new Error(
      "No se ha podido resolver el tenant a partir del host. " +
        "Asegúrate de acceder vía un subdominio Yantar (slug.yantar.app) " +
        "o un dominio personalizado registrado.",
    );
  }
  return slug;
}
