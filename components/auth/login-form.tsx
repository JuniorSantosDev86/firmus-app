"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type LoginFormProps = {
  nextPath: string | null;
  hasConfigError: boolean;
  usesDevelopmentDefaults: boolean;
  defaultUsername: string;
};

type LoginStatus = "idle" | "submitting" | "error";

function sanitizeNextPath(path: string | null): string {
  if (!path) {
    return "/";
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}

export function LoginForm({
  nextPath,
  hasConfigError,
  usesDevelopmentDefaults,
  defaultUsername,
}: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetPath = useMemo(() => sanitizeNextPath(nextPath), [nextPath]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setErrorMessage("Não foi possível autenticar com as credenciais informadas.");
        return;
      }

      setPassword("");
      router.replace(targetPath);
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Falha de conexão ao autenticar. Tente novamente.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] items-center px-4 py-12">
      <section className="firmus-panel w-full space-y-6" data-testid="login-page">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0B6D6D]">Área interna</p>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Acessar Firmus</h1>
          <p className="text-sm text-[#475569]">
            Faça login para acessar os dados operacionais e financeiros do workspace.
          </p>
        </header>

        {hasConfigError ? (
          <p className="rounded-lg border border-[#FECACA] bg-[#FFF1F2] px-3 py-2 text-sm text-[#9F1239]" data-testid="login-config-error">
            A autenticação está indisponível por configuração de segurança pendente.
          </p>
        ) : null}

        {usesDevelopmentDefaults ? (
          <p className="rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] px-3 py-2 text-xs text-[#92400E]" data-testid="login-dev-defaults-warning">
            Ambiente local com credenciais padrão. Configure variáveis seguras antes do go-live.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          <div className="grid gap-2">
            <label htmlFor="username" className="text-sm font-medium text-[#0F172A]">
              Usuário
            </label>
            <input
              id="username"
              name="username"
              className="firmus-input"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium text-[#0F172A]">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="firmus-input"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {status === "error" && errorMessage ? (
            <p className="text-sm text-[#B91C1C]" data-testid="login-error-message">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#0F172A] text-sm font-semibold text-white transition-colors hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "submitting" || hasConfigError}
            data-testid="login-submit"
          >
            {status === "submitting" ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
