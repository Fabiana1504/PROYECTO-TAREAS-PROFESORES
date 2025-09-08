'use client'

import { useState, useEffect } from 'react'
import { BookOpen, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useSubmissions } from '@/hooks/useSubmissions'
import { Task, Submission } from '@/types'
import SubmissionModal from './SubmissionModal'

export default function StudentDashboard() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [stats, setStats] = useState({
    assignedTasks: 0,
    submittedTasks: 0,
    pendingTasks: 0,
    averageScore: 0
  })

  const { tasks, loading: tasksLoading } = useTasks()
  const { submissions, loading: submissionsLoading } = useSubmissions()
  const loading = tasksLoading || submissionsLoading

  useEffect(() => {
    if (!loading && (tasks.length > 0 || submissions.length > 0)) {
      calculateStats()
    }
  }, [tasks, submissions, loading])

  const calculateStats = () => {
    if (!tasks || !submissions) return
    
    const submittedTasks = submissions.length
    const pendingTasks = tasks.length - submittedTasks
    const gradedSubmissions = submissions.filter((s: Submission) => s.status === 'graded')
    const averageScore = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
      : 0
    
    setStats({
      assignedTasks: tasks.length,
      submittedTasks,
      pendingTasks,
      averageScore: Math.round(averageScore)
    })
  }

  const handleSubmitTask = (task: Task) => {
    setSelectedTask(task)
    setShowSubmissionModal(true)
  }

  const handleSubmissionCreated = () => {
    // Los hooks se actualizarán automáticamente
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
                <p className="text-sm font-medium text-gray-500">Tareas Asignadas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.assignedTasks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Entregadas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.submittedTasks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingTasks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Promedio</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageScore}%</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="btn btn-primary btn-md w-full">
              <FileText className="h-4 w-4 mr-2" />
              Ver Mis Entregas
            </button>
            <button className="btn btn-outline btn-md w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Ver Tareas Asignadas
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Tasks */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tareas Asignadas</h3>
        </div>
        <div className="card-content">
          {!tasks || tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tienes tareas asignadas</p>
          ) : (
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task) => {
                const submission = submissions?.find(s => s.task?.id === task.id)
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !submission
                
                return (
                  <div key={task.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                    isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{task.title || 'Tarea sin título'}</h4>
                        {isOverdue && (
                          <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{task.description || 'Sin descripción'}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        Vence: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                        {isOverdue && <span className="text-red-500 ml-2">(Vencida)</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {submission ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          submission.status === 'submitted' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : submission.status === 'graded'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {submission.status === 'submitted' ? 'Entregada' : 
                           submission.status === 'graded' ? 'Calificada' : 'Devuelta'}
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSubmitTask(task)}
                          className="btn btn-primary btn-sm"
                        >
                          Entregar
                        </button>
                      )}
                      {submission?.score && (
                        <span className="text-sm font-medium text-gray-900">
                          {submission.score}/{task.maxScore}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* My Submissions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mis Entregas</h3>
        </div>
        <div className="card-content">
          {!submissions || submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No has entregado ninguna tarea</p>
          ) : (
            <div className="space-y-4">
              {submissions.slice(0, 5).map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{submission.task?.title || 'Tarea sin título'}</h4>
                    <p className="text-sm text-gray-500">Profesor: {submission.task?.professor?.name || 'N/A'}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Entregado: {new Date(submission.createdAt).toLocaleDateString()}
                      {submission.isLate && <span className="text-red-500 ml-2">(Tarde)</span>}
                    </div>
                    {submission.feedback && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{submission.feedback}"
                      </p>
                    )}
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

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        task={selectedTask}
        onSubmissionCreated={handleSubmissionCreated}
      />
    </div>
  )
}
