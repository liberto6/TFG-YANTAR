"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { ApiError, api } from "@/lib/api-client";
import { validateEmail, validatePassword } from "@/lib/validation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCompanyConfig } from "@/features/company/hooks/use-company-config";
import type { AuthUser } from "@/features/auth/types/auth.types";

interface LoginResponse {
  user: AuthUser;
  token: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { data: config } = useCompanyConfig();

  function handleEmailBlur() {
    if (email) setEmailError(validateEmail(email));
  }

  function handlePasswordBlur() {
    if (password) setPasswordError(validatePassword(password, 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const emailErr = validateEmail(email);
    const pwErr = validatePassword(password, 1);
    setEmailError(emailErr);
    setPasswordError(pwErr);
    if (emailErr || pwErr) return;

    setIsLoading(true);
    try {
      const data = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
        companyId: config?.id,
      });
      login(data.token, data.user);
      const destination = data.user.role === "RESTAURANT_ADMIN" ? "/admin/dashboard" : "/menu";
      router.push(destination);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.code === "INVALID_CREDENTIALS") {
          setSubmitError("Email o contraseña incorrectos. Vuelve a intentarlo.");
        } else if (err.status >= 500) {
          setSubmitError("El servicio no responde. Inténtalo en unos minutos.");
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError("No se pudo iniciar sesión. Comprueba tu conexión.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader className="text-center">
        <h1 className="text-h1 text-foreground">Bienvenido</h1>
        <p className="text-body-sm text-muted-foreground">Inicia sesión en tu cuenta</p>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {submitError && <Alert variant="danger">{submitError}</Alert>}

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
                onBlur={handleEmailBlur}
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              onBlur={handlePasswordBlur}
              required
              autoComplete="current-password"
              invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
            {passwordError && (
              <p id="password-error" className="text-caption text-danger" role="alert">
                {passwordError}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
          </Button>
          <p className="text-center text-body-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
