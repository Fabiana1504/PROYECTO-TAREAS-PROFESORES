'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileText, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { Task } from '@/types'
import toast from 'react-hot-toast'

interface SubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onSubmissionCreated: () => void
}

export default function SubmissionModal({ isOpen, onClose, task, onSubmissionCreated }: SubmissionModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [comments, setComments] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log('📁 File selected:', file)
    if (file) {
      setSelectedFile(file)
    } else {
      setSelectedFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    try {
      setLoading(true)
      
      console.log('🔍 Debug submission data:', {
        selectedFile: selectedFile,
        comments: comments,
        taskId: task.id
      })
      
      // Validate file
      if (!selectedFile) {
        console.log('❌ No file selected')
        toast.error('Debes seleccionar un archivo PDF')
        setLoading(false)
        return
      }
      
      console.log('📁 File details:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        lastModified: selectedFile.lastModified
      })
      
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        console.log('❌ Invalid file type:', selectedFile.type)
        toast.error('Solo se permiten archivos PDF')
        setLoading(false)
        return
      }
      
      // Validate file size
      if (selectedFile.size > 10 * 1024 * 1024) {
        console.log('❌ File too large:', selectedFile.size)
        toast.error('El archivo no puede ser mayor a 10MB')
        setLoading(false)
        return
      }
      
      // Create FormData exactly like the working test
      const formData = new FormData()
      formData.append('file', selectedFile, selectedFile.name)
      formData.append('comments', comments || '')
      formData.append('taskId', task.id)
      
      console.log('📤 FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value)
      }
      
      // Make request - let Axios handle Content-Type for FormData
      const response = await api.post('/submissions', formData)
      
      console.log('✅ Upload successful:', response.data)
      toast.success('¡Entrega enviada exitosamente!')
      
      // Reset form
      setSelectedFile(null)
      setComments('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      onSubmissionCreated()
      onClose()
    } catch (error: any) {
      console.error('Error submitting:', error)
      console.error('Error response:', error.response?.data)
      
      let errorMessage = 'Error al enviar la entrega'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Mostrar mensajes más específicos según el tipo de error
      if (error.response?.status === 400) {
        if (errorMessage.includes('Task ID')) {
          errorMessage = 'Error: No se pudo identificar la tarea'
        } else if (errorMessage.includes('File')) {
          errorMessage = 'Error: Debes seleccionar un archivo PDF válido'
        } else if (errorMessage.includes('not published')) {
          errorMessage = 'Error: Esta tarea no está disponible para entregas'
        } else if (errorMessage.includes('not assigned')) {
          errorMessage = 'Error: No estás asignado a esta tarea'
        } else if (errorMessage.includes('already exists')) {
          errorMessage = 'Ya has entregado esta tarea. No puedes entregarla nuevamente.'
        } else {
          errorMessage = `Error: ${errorMessage}`
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Error: Debes iniciar sesión para entregar tareas'
      } else if (error.response?.status === 403) {
        errorMessage = 'Error: No tienes permisos para entregar esta tarea'
      } else if (error.response?.status === 404) {
        errorMessage = 'Error: La tarea no existe'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !task) return null

  const isOverdue = new Date(task.dueDate) < new Date()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Entregar Tarea
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Task Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="h-4 w-4 mr-1" />
                  Vence: {new Date(task.dueDate).toLocaleDateString()}
                  {isOverdue && (
                    <span className="text-red-500 ml-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      (Vencida)
                    </span>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo PDF *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Seleccionar archivo</span>
                        <input
                          ref={fileInputRef}
                          id="file-upload"
                          type="file"
                          accept=".pdf,application/pdf"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta aquí</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF hasta 10MB
                    </p>
                  </div>
                </div>
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{selectedFile.name}</span>
                      <span className="ml-2 text-gray-500">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios (opcional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="input w-full"
                  placeholder="Agrega comentarios sobre tu entrega..."
                />
              </div>

              {/* Instructions */}
              {task.instructions && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Instrucciones</h4>
                  <p className="text-sm text-blue-800">{task.instructions}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline btn-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-md"
              >
                {loading ? 'Enviando...' : 'Enviar Entrega'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
