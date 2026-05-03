import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware de Yantar — slug runtime.
 *
 * Resuelve el tenant a partir del Host de la petición y lo expone como header
 * interno `x-yantar-slug` para que los Server Components y rutas API leídas en
 * SSR puedan obtenerlo sin depender de variables de entorno.
 *
 * Reglas:
 *   1. `napoli.<root>`           → slug = "napoli"  (subdominio Yantar)
 *   2. `<root>` o `www.<root>`   → slug = null      (landing pública del SaaS)
 *   3. Dominio personalizado     → resuelve por backend (`/companies/resolve`)
 *   4. Dev: `localhost` plano    → slug = null  (SaaSLanding)
 *      Dev: `<slug>.localhost`   → slug extraído del subdominio
 *
 * El root domain de producción se controla con la env
 * `NEXT_PUBLIC_YANTAR_ROOT_DOMAIN` (default `yantar.app`).
 */

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_YANTAR_ROOT_DOMAIN ?? "yantar.app";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const SLUG_HEADER = "x-yantar-slug";

function normalizeHost(host: string): string {
  const noPort = host.split(":")[0];
  return noPort.toLowerCase().replace(/\.$/, "");
}

function isLocalHost(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost")
  );
}

function extractSubdomain(host: string, root: string): string | null {
  if (host === root) return null;
  const suffix = "." + root;
  if (!host.endsWith(suffix)) return null;
  const prefix = host.slice(0, -suffix.length);
  if (!prefix || prefix === "www") return null;
  if (prefix.includes(".")) return null;
  return prefix;
}

async function resolveCustomDomain(host: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${API_URL}/companies/resolve?host=${encodeURIComponent(host)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { slug: string | null };
    return data.slug ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const headerHost = req.headers.get("host") ?? "";
  const host = normalizeHost(headerHost);

  let slug: string | null = null;

  if (isLocalHost(host)) {
    // Dev: solo `<slug>.localhost` resuelve a tenant. `localhost` plano y
    // `127.0.0.1` se quedan sin slug → renderizan la SaaSLanding.
    slug = extractSubdomain(host, "localhost");
  } else {
    const sub = extractSubdomain(host, ROOT_DOMAIN);
    if (sub) {
      slug = sub;
    } else if (host && host !== ROOT_DOMAIN && host !== `www.${ROOT_DOMAIN}`) {
      slug = await resolveCustomDomain(host);
    }
  }

  const headers = new Headers(req.headers);
  if (slug) {
    headers.set(SLUG_HEADER, slug);
  } else {
    headers.delete(SLUG_HEADER);
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Excluye assets estáticos. Aplica a todo lo demás (incluyendo / y rutas API
  // del propio Next, no las del backend NestJS).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
