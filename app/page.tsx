import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6">
      <section className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Firmus
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          The operational copilot for service providers.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Business Profile is now available.
        </p>
        <div className="mt-8">
          <Link
            href="/business-profile"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open Business Profile
          </Link>
        </div>
      </section>
    </main>
  );
}
