'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

export default function StudentsPage() {
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

  // Solo profesores pueden acceder a esta página
  if (user.role !== 'professor') {
    router.push('/dashboard')
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
          <p className="text-gray-600">Gestiona los estudiantes de tus clases</p>
        </div>

        <div className="card">
          <div className="card-content">
            <p className="text-gray-500 text-center py-8">
              Página de estudiantes en desarrollo...
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
