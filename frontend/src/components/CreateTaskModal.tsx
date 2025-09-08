'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Calendar, Users, FileText, Tag } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useUsers } from '@/hooks/useUsers'
import toast from 'react-hot-toast'
import { CreateTaskRequest } from '@/types'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: () => void
}

interface TaskFormData {
  title: string
  description: string
  dueDate: string
  maxScore: number
  instructions: string
  tags: string
  assignedTo: string[]
}

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormData>()
  const { createTask } = useTasks()
  const { users: students, fetchStudents } = useUsers()

  // Cargar estudiantes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchStudents()
    }
  }, [isOpen, fetchStudents])

  const onSubmit = async (data: TaskFormData) => {
    try {
      setLoading(true)
      
      const taskData: CreateTaskRequest = {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        maxScore: data.maxScore || 100,
        instructions: data.instructions || '',
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        assignedTo: data.assignedTo || []
      }

      console.log('Creating task with data:', taskData)
      console.log('Assigned to:', data.assignedTo)
      await createTask(taskData)
      
      toast.success('¡Tarea creada exitosamente!')
      reset()
      onTaskCreated()
      onClose()
    } catch (error: any) {
      console.error('Error creating task:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Error al crear la tarea')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Crear Nueva Tarea</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la tarea *
                  </label>
                  <input
                    {...register('title', { required: 'El título es requerido' })}
                    type="text"
                    className="input"
                    placeholder="Ej: Ensayo sobre la Revolución Francesa"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    {...register('description', { required: 'La descripción es requerida' })}
                    rows={3}
                    className="input"
                    placeholder="Describe los objetivos y requisitos de la tarea..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Fecha de vencimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de vencimiento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      {...register('dueDate', { required: 'La fecha de vencimiento es requerida' })}
                      type="datetime-local"
                      className="input pl-10"
                    />
                  </div>
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
                  )}
                </div>

                {/* Puntuación máxima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puntuación máxima
                  </label>
                  <input
                    {...register('maxScore', { 
                      valueAsNumber: true,
                      min: { value: 1, message: 'La puntuación debe ser mayor a 0' },
                      max: { value: 1000, message: 'La puntuación no puede exceder 1000' }
                    })}
                    type="number"
                    className="input"
                    placeholder="100"
                    defaultValue={100}
                  />
                  {errors.maxScore && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxScore.message}</p>
                  )}
                </div>

                {/* Instrucciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrucciones adicionales
                  </label>
                  <textarea
                    {...register('instructions')}
                    rows={3}
                    className="input"
                    placeholder="Instrucciones específicas para los estudiantes..."
                  />
                </div>

                {/* Etiquetas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etiquetas
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      {...register('tags')}
                      type="text"
                      className="input pl-10"
                      placeholder="historia, ensayo, individual (separadas por comas)"
                    />
                  </div>
                </div>

                {/* Estudiantes asignados */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asignar a estudiantes
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      {...register('assignedTo')}
                      multiple
                      className="input pl-10"
                      size={4}
                    >
                      {students.map((student, index) => (
                        <option key={student.id || index} value={student.id}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples estudiantes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-md w-full sm:w-auto sm:ml-3"
              >
                {loading ? 'Creando...' : 'Crear Tarea'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline btn-md w-full sm:w-auto mt-3 sm:mt-0"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
