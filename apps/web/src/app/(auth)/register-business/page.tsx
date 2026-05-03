"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Building2, Mail, User as UserIcon } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength, scorePassword } from "@/components/ui/password-strength";
import { ApiError, api } from "@/lib/api-client";
import { validateEmail, validateName, validatePassword } from "@/lib/validation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { AuthUser } from "@/features/auth/types/auth.types";

interface RegisterBusinessResponse {
  user: AuthUser;
  company: { id: string; name: string; slug: string };
}

/**
 * Construye la URL pública del tenant recién creado.
 *
 * Mantiene el protocolo y puerto actuales del navegador para que funcione
 * tanto en producción (`https://napoli.yantar.app`) como en desarrollo local
 * (`http://napoli.localhost:3000`).
 *
 * Si el navegador está en localhost o 127.x, fuerza `localhost` como dominio
 * raíz aunque la env apunte a `yantar.app` — así no hay que tocar .env.local
 * para probar el flujo end-to-end en dev.
 */
function buildTenantUrl(slug: string): string {
  if (typeof window === "undefined") return `https://${slug}.yantar.app`;
  const currentHost = window.location.hostname;
  const isLocal =
    currentHost === "localhost" ||
    currentHost === "127.0.0.1" ||
    currentHost.endsWith(".localhost");
  const rootDomain = isLocal
    ? "localhost"
    : (process.env.NEXT_PUBLIC_YANTAR_ROOT_DOMAIN ?? "yantar.app");
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";
  return `${protocol}//${slug}.${rootDomain}${port}`;
}

export default function RegisterBusinessPage() {
  const { login } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [companyNameError, setCompanyNameError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<RegisterBusinessResponse | null>(null);

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const cnErr = companyName.trim().length < 2 ? "El nombre del restaurante es obligatorio." : null;
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const pwErr = validatePassword(password, 8);
    setCompanyNameError(cnErr);
    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(pwErr);
    if (cnErr || nameErr || emailErr || pwErr) return;

    if (password !== confirmPassword) {
      setSubmitError("Las contraseñas no coinciden.");
      return;
    }
    if (scorePassword(password) < 2) {
      setSubmitError(
        "Elige una contraseña más segura (al menos 8 caracteres con mayúsculas, números o símbolos).",
      );
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.post<RegisterBusinessResponse>(
        "/auth/register-business",
        {
          email,
          password,
          displayName: name,
          companyName,
        },
      );
      setSuccess(data);
      login(data.user.id, data.user);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.code === "USER_ALREADY_EXISTS") {
          setSubmitError(
            "Ya existe una cuenta con este email. Prueba a iniciar sesión.",
          );
        } else if (err.status >= 500) {
          setSubmitError("El servicio no responde. Inténtalo en unos minutos.");
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError("No se pudo crear el restaurante. Comprueba tu conexión.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    const tenantHome = buildTenantUrl(success.company.slug);
    return (
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-h1 text-foreground">¡Bienvenido a Yantar!</h1>
          <p className="text-body-sm text-muted-foreground">
            Hemos creado tu restaurante <strong>{success.company.name}</strong>.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-caption uppercase tracking-wider text-muted-foreground">
              Tu URL pública
            </p>
            <p className="mt-1 break-all font-mono text-body text-primary">
              {tenantHome}
            </p>
          </div>
          <p className="text-body-sm text-muted-foreground">
            Te enviamos al panel de administración para configurar tu primera
            sede, branding y carta. Cuando termines, comparte la URL con tus
            clientes.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              window.location.href = `${tenantHome}/admin/dashboard`;
            }}
          >
            Entrar al panel
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="space-y-1 text-center">
        <h1 className="text-h1 text-foreground">Crea tu restaurante en Yantar</h1>
        <p className="text-body-sm text-muted-foreground">
          Configura tu carta y empieza a recibir pedidos hoy mismo
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {submitError && <Alert variant="danger">{submitError}</Alert>}

          <div className="space-y-1.5">
            <Label htmlFor="companyName" required>
              Nombre del restaurante
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Building2 size={16} />
              </span>
              <Input
                id="companyName"
                placeholder="Pizzería Nápoli"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (companyNameError) setCompanyNameError(null);
                }}
                required
                invalid={Boolean(companyNameError)}
                aria-describedby={companyNameError ? "company-error" : undefined}
                className="pl-9"
              />
            </div>
            {companyNameError && (
              <p id="company-error" className="text-caption text-danger" role="alert">
                {companyNameError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" required>
              Tu nombre
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <UserIcon size={16} />
              </span>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                required
                autoComplete="name"
                invalid={Boolean(nameError)}
                aria-describedby={nameError ? "name-error" : undefined}
                className="pl-9"
              />
            </div>
            {nameError && (
              <p id="name-error" className="text-caption text-danger" role="alert">
                {nameError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" required>
              Email
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail size={16} />
              </span>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                required
                autoComplete="email"
                invalid={Boolean(emailError)}
                aria-describedby={emailError ? "email-error" : undefined}
                className="pl-9"
              />
            </div>
            {emailError && (
              <p id="email-error" className="text-caption text-danger" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" required>
              Contraseña
            </Label>
            <PasswordInput
              id="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              required
              minLength={8}
              autoComplete="new-password"
              invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : "password-strength"}
            />
            {passwordError ? (
              <p id="password-error" className="text-caption text-danger" role="alert">
                {passwordError}
              </p>
            ) : (
              <div id="password-strength">
                <PasswordStrength password={password} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" required>
              Confirmar contraseña
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              invalid={passwordMismatch}
              aria-describedby={passwordMismatch ? "confirm-error" : undefined}
            />
            {passwordMismatch && (
              <p id="confirm-error" className="text-caption text-danger" role="alert">
                Las contraseñas no coinciden.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isLoading}
            disabled={passwordMismatch}
          >
            {isLoading ? "Creando restaurante…" : "Crear restaurante"}
          </Button>
          <p className="text-center text-body-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
