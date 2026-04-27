import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '@/lib/jwt'
import OrdersDashboard from '@/components/OrdersDashboard'

export default async function UserOrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    redirect('/login')
  }

  let user
  try {
    user = verifyAccessToken(token)
  } catch {
    redirect('/login')
  }

  if (user.role !== 'user') {
    redirect('/admin/orders')
  }

  return (
    <OrdersDashboard
      user={{ userId: user.userId, email: user.email, role: user.role }}
    />
  )
}

