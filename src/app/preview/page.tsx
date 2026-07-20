import Link from "next/link";
import { PreviewChrome } from "@/components/preview/PreviewChrome";

const OPTIONS = [
  {
    id: "a",
    href: "/preview/a",
    title: "A · Casi actual",
    idea: "Misma estructura y flujo; polish mínimo de densidad y chrome de preview.",
    tradeoff: "Seguro para migrar sin reaprendizaje; poco salto perceptual.",
  },
  {
    id: "b",
    href: "/preview/b",
    title: "B · Evolutiva",
    idea: "Workspace: plan a la izquierda, requerimientos + adecuación sticky a la derecha.",
    tradeoff: "Más ágil para cerrar gaps sin scrollear al fondo; más denso en desktop.",
  },
  {
    id: "c",
    href: "/preview/c",
    title: "C · Rediseño fuerte",
    idea: "Command center: cobertura del día como protagonista; comidas en pestañas compactas.",
    tradeoff: "Jerarquía clara de “¿cuánto falta?”; tablas más contenidas, menos vista Excel.",
  },
  {
    id: "d",
    href: "/preview/d",
    title: "D · Solo concepto",
    idea: "Flujo por cobertura: los gaps guían qué agregar; sin herencia del layout actual.",
    tradeoff: "Máximo foco en el job-to-be-done; curva distinta a una hoja de cálculo.",
  },
] as const;

export default function PreviewHubPage() {
  return (
    <>
      <PreviewChrome
        option="hub"
        blurb="Elegí una dirección. El original en / no se modifica."
      />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Previews UI · Nutrimatic
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Espectro desde casi-igual hasta solo-concepto. Cada una es interactiva
          con data de ejemplo.
        </p>
        <ul className="mt-8 space-y-4">
          {OPTIONS.map((opt) => (
            <li key={opt.id}>
              <Link
                href={opt.href}
                className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/30 hover:bg-muted/40"
              >
                <p className="font-semibold">{opt.title}</p>
                <p className="mt-1 text-sm text-foreground/80">{opt.idea}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tradeoff: {opt.tradeoff}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
