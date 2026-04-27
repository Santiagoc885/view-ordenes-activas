import { NextRequest } from 'next/server'
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/jwt'
import { setAuthCookies } from '@/utils/cookies'
import { successResponse, errorResponse } from '@/utils/response'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value
    if (!refreshToken) return errorResponse('No hay refresh token', 401)

    const payload = verifyRefreshToken(refreshToken)
    const newAccess = signAccessToken({ userId: payload.userId, role: payload.role, email: payload.email })
    const newRefresh = signRefreshToken({ userId: payload.userId, role: payload.role, email: payload.email })

    const response = successResponse(null, 'Token renovado')
    setAuthCookies(response, newAccess, newRefresh)

    return response
  } catch {
    return errorResponse('Refresh token inválido o expirado', 401)
  }
}
