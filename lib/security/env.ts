const DEVELOPMENT_DEFAULTS = {
  username: "owner@firmus.local",
  passwordHash:
    "scrypt$8f3a4fbf9016b87df62ce9b98ea8b0f5$b494ab410245d52df0ef3e2567e6df1f0b49a0e8d573218c9e8daba64a15d8f654bd0dd57177c23d45e1a4e1690525ecd8102f977ddee2850af8b5d396a4a927",
  sessionSecret: "firmus-dev-session-secret-change-this-before-production-2026",
  sessionTtlSeconds: 60 * 60 * 8,
} as const;

export type SecurityEnv = {
  authUsername: string;
  authPasswordHash: string;
  sessionSecret: string;
  sessionTtlSeconds: number;
  sessionCookieName: string;
  secureCookie: boolean;
  secureStoreFile: string;
  usesDevelopmentDefaults: boolean;
};

export class SecurityEnvError extends Error {
  readonly code = "SECURITY_ENV_INVALID";
}

let cachedEnv: SecurityEnv | null = null;

function readInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function normalizeValue(value: string | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isProductionNodeEnv(nodeEnv: string): boolean {
  return nodeEnv === "production";
}

function buildEnv(source: NodeJS.ProcessEnv): SecurityEnv {
  const nodeEnv = source.NODE_ENV ?? "development";
  const production = isProductionNodeEnv(nodeEnv);

  const explicitUsername = normalizeValue(source.FIRMUS_AUTH_USERNAME);
  const explicitPasswordHash = normalizeValue(source.FIRMUS_AUTH_PASSWORD_HASH);
  const explicitSessionSecret = normalizeValue(source.FIRMUS_SESSION_SECRET);

  const canUseDefaults = !production;
  const authUsername = explicitUsername ?? (canUseDefaults ? DEVELOPMENT_DEFAULTS.username : null);
  const authPasswordHash =
    explicitPasswordHash ?? (canUseDefaults ? DEVELOPMENT_DEFAULTS.passwordHash : null);
  const sessionSecret =
    explicitSessionSecret ?? (canUseDefaults ? DEVELOPMENT_DEFAULTS.sessionSecret : null);

  if (authUsername === null || authPasswordHash === null || sessionSecret === null) {
    throw new SecurityEnvError(
      "Configuração de segurança ausente. Defina FIRMUS_AUTH_USERNAME, FIRMUS_AUTH_PASSWORD_HASH e FIRMUS_SESSION_SECRET."
    );
  }

  if (sessionSecret.length < 32) {
    throw new SecurityEnvError("FIRMUS_SESSION_SECRET deve ter ao menos 32 caracteres.");
  }

  return {
    authUsername,
    authPasswordHash,
    sessionSecret,
    sessionTtlSeconds: readInteger(
      source.FIRMUS_SESSION_TTL_SECONDS,
      DEVELOPMENT_DEFAULTS.sessionTtlSeconds
    ),
    sessionCookieName: "firmus_session",
    secureCookie: production,
    secureStoreFile:
      normalizeValue(source.FIRMUS_SECURE_STORAGE_FILE) ?? "/tmp/firmus-security-foundation.json",
    usesDevelopmentDefaults:
      canUseDefaults &&
      (explicitUsername === null || explicitPasswordHash === null || explicitSessionSecret === null),
  };
}

export function getSecurityEnv(): SecurityEnv {
  if (cachedEnv !== null) {
    return cachedEnv;
  }

  cachedEnv = buildEnv(process.env);
  return cachedEnv;
}

export function checkSecurityEnv(): { ok: true; env: SecurityEnv } | { ok: false; error: string } {
  try {
    return { ok: true, env: getSecurityEnv() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha de configuração de segurança.";
    return { ok: false, error: message };
  }
}

export function evaluateSecurityEnv(source: NodeJS.ProcessEnv): SecurityEnv {
  return buildEnv(source);
}
