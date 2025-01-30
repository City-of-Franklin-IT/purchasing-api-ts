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