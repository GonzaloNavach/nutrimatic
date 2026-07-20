"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error: signError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (signError) throw signError;

        if (data.session) {
          router.push("/pricing");
          router.refresh();
          return;
        }

        setInfo(
          "Revisá tu correo para confirmar la cuenta. Después podés iniciar sesión."
        );
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo continuar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      {mode === "signup" ? (
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre</Label>
          <Input
            id="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="text-sm text-muted-foreground" role="status">
          {info}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? "Esperá…"
          : mode === "login"
            ? "Entrar"
            : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            ¿No tenés cuenta?{" "}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Registrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Iniciá sesión
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
