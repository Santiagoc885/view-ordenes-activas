'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface OrderItem {
  id?: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  client: string
  total: number
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED'
  createdAt: string
  items: OrderItem[]
}

interface DashboardUser {
  userId: string
  email: string
  role: string
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
}

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Proceso',
  DELIVERED: 'Entregado',
}

const emptyForm = { client: '', items: [{ name: '', price: '', quantity: 1 }] }

interface OrdersDashboardProps {
  user: DashboardUser
}

export default function OrdersDashboard({ user }: OrdersDashboardProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'DELIVERED'>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{ client: string; items: { name: string; price: string | number; quantity: number }[] }>(emptyForm)
  const [error, setError] = useState('')

  const isAdmin = user.role === 'admin'

  const fetchOrders = async () => {
    try {
      const status = filter === 'ALL' ? '' : `status=${filter}`
      const res = await fetch(`/api/orders?${status}`, { credentials: 'include' })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    const eventSource = new EventSource('/api/orders/stream', { withCredentials: true })
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (filter === 'ALL') {
          setOrders(data)
        } else {
          setOrders(data.filter((order: Order) => order.status === filter))
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err)
      }
    }

    eventSource.onerror = () => eventSource.close()
    return () => eventSource.close()
  }, [filter])

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      if (res.ok) fetchOrders()
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta orden?')) return
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.status === 403) {
        setError('Solo los administradores pueden eliminar órdenes')
        setTimeout(() => setError(''), 3000)
        return
      }
      if (res.ok) fetchOrders()
    } catch (err) {
      console.error('Error deleting order:', err)
    }
  }

  const startEdit = (order: Order) => {
    setEditingId(order.id)
    setFormData({
      client: order.client,
      items: order.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    const totalPrice = formData.items.reduce(
      (sum, item) => sum + (parseFloat(item.price as any) || 0) * item.quantity,
      0
    )

    const payload = {
      client: formData.client,
      total: totalPrice,
      items: formData.items.map((item) => ({
        name: item.name,
        price: parseFloat(item.price as any),
        quantity: item.quantity,
      })),
    }

    try {
      const url = editingId ? `/api/orders/${editingId}` : '/api/orders'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        cancelForm()
        fetchOrders()
      } else {
        setError('Error al guardar la orden')
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      console.error('Error saving order:', err)
    }
  }

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { name: '', price: '', quantity: 1 }] })
  }

  const removeItem = (idx: number) => {
    if (formData.items.length === 1) return
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) })
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Órdenes Activas</h1>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'PENDING', 'IN_PROGRESS', 'DELIVERED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                {s === 'ALL' ? 'Todas' : STATUS_LABELS[s as keyof typeof STATUS_LABELS]}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (showForm) cancelForm()
              else setShowForm(true)
            }}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            {showForm ? 'Cerrar' : '+ Nueva Orden'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Orden' : 'Crear Nueva Orden'}
            </h2>
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Productos</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    + Agregar producto
                  </button>
                </div>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[idx].name = e.target.value
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Precio"
                      value={item.price}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[idx].price = e.target.value
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[idx].quantity = parseInt(e.target.value) || 1
                        setFormData({ ...formData, items: newItems })
                      }}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Orden'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600">Cargando órdenes...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No hay órdenes disponibles</div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{order.client}</h3>
                    <p className="text-sm text-gray-600">ID: {order.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </div>
                  </div>
                </div>

                <div className="mb-3 border-t border-b border-gray-200 py-3">
                  <div className="text-sm text-gray-700">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</div>
                  <div className="flex gap-2 flex-wrap">
                    {order.status !== 'DELIVERED' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            order.status === 'PENDING' ? 'IN_PROGRESS' : 'DELIVERED'
                          )
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        {order.status === 'PENDING' ? 'Procesar' : 'Entregar'}
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(order)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition"
                    >
                      Editar
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

