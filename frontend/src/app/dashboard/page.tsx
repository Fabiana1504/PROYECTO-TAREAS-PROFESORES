'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import ProfessorDashboard from '@/components/ProfessorDashboard'
import StudentDashboard from '@/components/StudentDashboard'

export default function Dashboard() {
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
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, {user.name}!
          </h1>
          <p className="text-gray-600">
            {user.role === 'professor' ? 'Panel de Profesor' : 'Panel de Estudiante'}
          </p>
        </div>

        {user.role === 'professor' ? (
          <ProfessorDashboard />
        ) : (
          <StudentDashboard />
        )}
      </div>
    </DashboardLayout>
  )
}
