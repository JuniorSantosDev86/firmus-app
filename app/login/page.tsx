import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { checkSecurityEnv } from "@/lib/security/env";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const metadata: Metadata = {
  title: "Login",
  description: "Acesso interno seguro do Firmus.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const security = checkSecurityEnv();

  return (
    <LoginForm
      nextPath={typeof params.next === "string" ? params.next : null}
      hasConfigError={params.error === "config" || !security.ok}
      usesDevelopmentDefaults={security.ok ? security.env.usesDevelopmentDefaults : false}
      defaultUsername={security.ok ? security.env.authUsername : ""}
    />
  );
}
