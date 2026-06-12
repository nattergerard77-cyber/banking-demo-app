export const DEMO_LOGIN_ID = "FDML2226"
export const DEMO_LOGIN_PASSWORD = "641312"

export interface DemoCredentials {
  loginId: string
  password: string
}

export type CredentialError =
  | { valid: false; field: "loginId"; message: string }
  | { valid: false; field: "password"; message: string }
  | { valid: true };

export function verifyDemoCredentials(credentials: DemoCredentials): CredentialError {
  if (credentials.loginId !== DEMO_LOGIN_ID) {
    return { valid: false, field: "loginId", message: "Identifiant incorrect" };
  }
  if (credentials.password !== DEMO_LOGIN_PASSWORD) {
    return { valid: false, field: "password", message: "Mot de passe incorrect" };
  }
  return { valid: true };
}
