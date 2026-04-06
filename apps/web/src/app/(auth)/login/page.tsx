"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    // TODO: integrate with auth API
    console.log("Login attempt:", { email });
    setTimeout(() => setIsLoading(false), 1000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Yantar</h1>
          <p className="text-sm text-muted-foreground">
            Inicia sesion en tu cuenta
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Contrasena
              </label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Iniciar sesion"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Registrate
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
