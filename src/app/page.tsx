import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '@/lib/jwt'

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    redirect('/login')
  }

  try {
    const user = verifyAccessToken(token)
    if (user.role === 'admin') {
      redirect('/admin/orders')
    }
    redirect('/user/orders')
  } catch {
    redirect('/login')
  }
}

