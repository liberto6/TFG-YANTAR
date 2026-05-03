"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User as UserIcon } from "lucide-react";
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
import { useCompanyConfig } from "@/features/company/hooks/use-company-config";
import type { AuthUser } from "@/features/auth/types/auth.types";

interface RegisterResponse {
  user: AuthUser;
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { data: config } = useCompanyConfig();

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const pwErr = validatePassword(password, 8);
    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(pwErr);
    if (nameErr || emailErr || pwErr) return;

    if (password !== confirmPassword) {
      setSubmitError("Las contraseñas no coinciden.");
      return;
    }
    if (scorePassword(password) < 2) {
      setSubmitError("Elige una contraseña más segura (al menos 8 caracteres con mayúsculas, números o símbolos).");
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.post<RegisterResponse>("/auth/register", {
        email,
        password,
        displayName: name,
        companyId: config?.id,
      });
      login(data.user.id, data.user);
      router.push("/menu");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.code === "USER_ALREADY_EXISTS") {
          setSubmitError("Ya existe una cuenta con este email. Prueba a iniciar sesión.");
        } else if (err.status >= 500) {
          setSubmitError("El servicio no responde. Inténtalo en unos minutos.");
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError("No se pudo crear la cuenta. Comprueba tu conexión.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader className="text-center">
        <h1 className="text-h1 text-foreground">Crea tu cuenta</h1>
        <p className="text-body-sm text-muted-foreground">
          Empieza a pedir en segundos
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-4">
          {submitError && <Alert variant="danger">{submitError}</Alert>}

          <div className="space-y-1.5">
            <Label htmlFor="name" required>
              Nombre
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
                onBlur={() => name && setNameError(validateName(name))}
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
                onBlur={() => email && setEmailError(validateEmail(email))}
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
              onBlur={() => password && setPasswordError(validatePassword(password, 8))}
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
            {isLoading ? "Creando cuenta…" : "Crear cuenta"}
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
