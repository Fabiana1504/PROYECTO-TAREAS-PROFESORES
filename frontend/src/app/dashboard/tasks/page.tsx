'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

export default function TasksPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600">
            {user.role === 'professor' 
              ? 'Gestiona las tareas de tus estudiantes' 
              : 'Ve las tareas asignadas para ti'
            }
          </p>
        </div>

        <div className="card">
          <div className="card-content">
            <p className="text-gray-500 text-center py-8">
              Página de tareas en desarrollo...
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
