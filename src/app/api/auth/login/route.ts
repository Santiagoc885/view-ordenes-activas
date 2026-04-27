import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken } from '@/lib/jwt'
import { setAuthCookies } from '@/utils/cookies'
import { successResponse, errorResponse } from '@/utils/response'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return errorResponse('Credenciales inválidas', 401)
    if (user.status !== 'ACTIVE') return errorResponse('Usuario inactivo', 403)

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return errorResponse('Credenciales inválidas', 401)

    const payload = { userId: user.id, role: user.role, email: user.email }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    const response = successResponse({ id: user.id, email: user.email, role: user.role }, 'Login exitoso')
    setAuthCookies(response, accessToken, refreshToken)

    return response
  } catch (err) {
    console.error('Login error:', err)
    return errorResponse('Error interno del servidor', 500)
  }
}
