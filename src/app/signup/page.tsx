import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function SignupPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Empezá con tu suscripción mensual cuando quieras."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthShell>
  );
}
