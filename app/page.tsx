import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6">
      <section className="w-full max-w-xl text-center">
        <Image
          src="/brand/firmus-logo-square.png"
          alt="Logo Firmus"
          width={48}
          height={48}
          className="mx-auto h-12 w-12"
          priority
        />
        <Image
          src="/brand/firmus-logo-horizontal.png"
          alt="Firmus"
          width={720}
          height={226}
          className="mx-auto mt-4 h-auto w-64"
          priority
        />
        <h1 className="sr-only">Firmus</h1>
        <p className="mt-4 text-base text-muted-foreground">
          O copiloto operacional para prestadores de serviços.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Perfil da empresa, clientes, serviços, orçamentos e cobranças já estão disponíveis.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/business-profile"
            data-testid="nav-business-profile"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Abrir perfil da empresa
          </Link>
          <Link
            href="/clients"
            data-testid="nav-clients"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Abrir clientes
          </Link>
          <Link
            href="/services"
            data-testid="nav-services"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Abrir serviços
          </Link>
          <Link
            href="/quotes"
            data-testid="nav-quotes"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Abrir orçamentos
          </Link>
          <Link
            href="/charges"
            data-testid="nav-charges"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Abrir cobranças
          </Link>
          <Link
            href="/financial-overview"
            data-testid="nav-financial-overview"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Abrir visão financeira
          </Link>
        </div>
      </section>
    </main>
  );
}
