import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/utils/response'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return errorResponse('Email, contraseña y nombre son requeridos', 400)
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return errorResponse('El email ya está registrado', 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user',
        status: 'ACTIVE',
      },
    })

    return successResponse({ id: user.id, email: user.email }, 'Usuario registrado exitosamente', 201)
  } catch (error) {
    console.error('Register error:', error)
    return errorResponse('Error al registrar usuario', 500)
  }
}
