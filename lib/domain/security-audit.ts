export type SecurityAuditAction =
  | "auth_login_success"
  | "auth_login_failure"
  | "auth_logout"
  | "private_route_access_denied"
  | "private_api_access_denied"
  | "privacy_foundation_review_recorded"
  | "security_config_error";

export type SecurityAuditActorType = "owner" | "anonymous" | "system";

export type SecurityAuditRecord = {
  id: string;
  action: SecurityAuditAction;
  actorType: SecurityAuditActorType;
  actorId: string | null;
  route: string | null;
  metadata: Record<string, string | number | boolean | null>;
  occurredAt: string;
};
