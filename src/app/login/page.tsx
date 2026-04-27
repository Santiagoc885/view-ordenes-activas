'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        setError(`Error del servidor (${res.status})`)
        return
      }

      if (!res.ok) {
        setError(data.message || `Error al iniciar sesión (${res.status})`)
        return
      }

      if (data.data?.role === 'admin') {
        router.replace('/admin/orders')
      } else {
        router.replace('/user/orders')
      }
    } catch (err) {
      setError('Error de conexión: ¿El servidor está corriendo?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Órdenes Activas</h1>
        <p className="text-center text-gray-600 mb-8">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="space-y-3 mt-6">
          <p className="text-center text-gray-600 text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
              Regístrate aquí
            </Link>
          </p>
          <div className="text-center text-gray-500 text-xs border-t pt-4 space-y-1">
            <p>
              Admin: <span className="font-mono">admin@test.com</span> / <span className="font-mono">admin123</span>
            </p>
            <p>
              Usuario: <span className="font-mono">user@test.com</span> / <span className="font-mono">user123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
