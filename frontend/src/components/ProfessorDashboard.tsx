'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Users, FileText, Plus, Calendar, CheckCircle } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useSubmissions } from '@/hooks/useSubmissions'
import CreateTaskModal from './CreateTaskModal'

export default function ProfessorDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
    totalStudents: 0
  })

  const { tasks, loading: tasksLoading } = useTasks()
  const { submissions, loading: submissionsLoading } = useSubmissions()

  const loading = tasksLoading || submissionsLoading

  useEffect(() => {
    if (submissions.length > 0) {
      const pendingSubmissions = submissions.filter(s => s.status === 'submitted').length
      const gradedSubmissions = submissions.filter(s => s.status === 'graded').length
      
      setStats({
        totalTasks: tasks.length,
        pendingSubmissions,
        gradedSubmissions,
        totalStudents: new Set(submissions.map(s => s.student.id)).size
      })
    }
  }, [tasks, submissions])

  const handleTaskCreated = () => {
    // Los datos se actualizarán automáticamente gracias a los hooks
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tareas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingSubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Calificadas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.gradedSubmissions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Estudiantes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Acciones Rápidas</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-md w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </button>
            <button className="btn btn-outline btn-md w-full">
              <FileText className="h-4 w-4 mr-2" />
              Ver Entregas
            </button>
            <button className="btn btn-outline btn-md w-full">
              <Users className="h-4 w-4 mr-2" />
              Gestionar Estudiantes
            </button>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tareas Recientes</h3>
        </div>
        <div className="card-content">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay tareas creadas aún</p>
          ) : (
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Vence: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : task.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'published' ? 'Publicada' : 
                       task.status === 'draft' ? 'Borrador' : 'Cerrada'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Entregas Recientes</h3>
        </div>
        <div className="card-content">
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay entregas aún</p>
          ) : (
            <div className="space-y-4">
              {submissions.slice(0, 5).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{submission.task.title}</h4>
                    <p className="text-sm text-gray-500">Estudiante: {submission.student.name}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Entregado: {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      submission.status === 'submitted' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : submission.status === 'graded'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {submission.status === 'submitted' ? 'Pendiente' : 
                       submission.status === 'graded' ? 'Calificada' : 'Devuelta'}
                    </span>
                    {submission.score && (
                      <span className="text-sm font-medium text-gray-900">
                        {submission.score}/{submission.task.maxScore}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  )
}
