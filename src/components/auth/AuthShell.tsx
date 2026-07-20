import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,216,104,0.12),_transparent_55%),linear-gradient(180deg,var(--color-background),var(--color-muted))]"
      />
      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href="/pricing"
            className="text-2xl font-semibold tracking-tight text-primary"
          >
            Nutrimatic
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
