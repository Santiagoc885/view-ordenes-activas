import { NextRequest } from 'next/server'
import { verifyAccessToken, JwtPayload } from './jwt'

export function getCurrentUser(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get('access_token')?.value
  if (!token) return null
  try {
    return verifyAccessToken(token)
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest): JwtPayload {
  const user = getCurrentUser(req)
  if (!user) {
    const error = new Error('No autenticado')
    ;(error as any).status = 401
    throw error
  }
  return user
}

export function requireAdmin(req: NextRequest): JwtPayload {
  const user = requireAuth(req)
  if (user.role !== 'admin') {
    const error = new Error('Acceso denegado: se requiere rol de administrador')
    ;(error as any).status = 403
    throw error
  }
  return user
}

