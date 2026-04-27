import { NextResponse } from 'next/server'

const isProduction = process.env.NODE_ENV === 'production'

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: 900,
  path: '/',
}

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: 604800,
  path: '/',
}

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.cookies.set('access_token', accessToken, ACCESS_COOKIE_OPTIONS)
  response.cookies.set('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS)
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
}
