import { NextResponse } from 'next/server'
import { clearAuthCookies } from '@/utils/cookies'
import { successResponse } from '@/utils/response'

export const dynamic = 'force-dynamic'

export async function POST() {
  const response = successResponse(null, 'Sesión cerrada')
  clearAuthCookies(response)
  return response
}
