export type AuthRole = "guest" | "customer" | "client" | "specialist" | "company" | "admin";

export type OperationalRole = "guest" | "customer" | "specialist" | "company" | "admin";

export type AuthProvider = "supabase" | "clerk" | "auth0" | "custom_jwt" | "mock" | "admin_session";

export type AuthSession = {
  userId: string;
  role: OperationalRole;
  email?: string;
  phone?: string;
  name?: string;
  provider: AuthProvider;
  issuedAt?: string;
  expiresAt?: string;
  token?: string;
};

export type AuthDecision = {
  ok: boolean;
  reason?: "missing_session" | "expired_session" | "forbidden_role" | "demo_auth_disabled";
  session?: AuthSession;
};
