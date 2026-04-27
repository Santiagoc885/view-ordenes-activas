import { NextResponse } from 'next/server'

export function successResponse(data: any, message: string = 'Exitoso', status: number = 200) {
  return NextResponse.json({ success: true, message, data }, { status })
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ success: false, message }, { status })
}
