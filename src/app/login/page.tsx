import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      subtitle="Accedé a tu cuenta de Nutrimatic."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
