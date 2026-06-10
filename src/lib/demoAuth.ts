export const DEMO_LOGIN_ID = "FDML2226"
export const DEMO_LOGIN_PASSWORD = "641312"

export interface DemoCredentials {
  loginId: string
  password: string
}

export function verifyDemoCredentials(credentials: DemoCredentials): boolean {
  return (
    credentials.loginId === DEMO_LOGIN_ID &&
    credentials.password === DEMO_LOGIN_PASSWORD
  )
}
