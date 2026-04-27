import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse } from '@/utils/response'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user) {
      return errorResponse('No autenticado', 401)
    }
    return successResponse({ userId: user.userId, email: user.email, role: user.role })
  } catch {
    return errorResponse('Error interno del servidor', 500)
  }
}

