export interface ValidateCookieResponse {
  success: boolean
  data: UserInterface
}

export interface UserInterface {
  role: string
  department: string
  email: string
  iat: number
  exp: number
}

export interface EntraUserInterface {
  aud: string
  exp: number
  iat: number
  iss: string
  name: string
  nbf: number
  nonce: string
  oid: string
  preferred_username: string
  rh: string
  roles: string[]
  sid: string
  sub: string
  tid: string
  uti: string
  ver: string
}