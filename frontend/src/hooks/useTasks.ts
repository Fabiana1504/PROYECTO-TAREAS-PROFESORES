import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Task } from '@/types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/tasks')
      const tasks = response.data.tasks || []
      // Mapear _id a id para compatibilidad
      const mappedTasks = tasks.map((task: any) => ({
        ...task,
        id: task._id || task.id,
        professor: task.professor ? {
          ...task.professor,
          id: task.professor._id || task.professor.id
        } : task.professor,
        assignedTo: task.assignedTo ? task.assignedTo.map((user: any) => ({
          ...user,
          id: user._id || user.id
        })) : task.assignedTo
      }))
      setTasks(mappedTasks)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar tareas')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: any) => {
    try {
      console.log('Creating task with data:', taskData)
      const response = await api.post('/tasks', taskData)
      const newTask = response.data.task
      setTasks(prev => [newTask, ...prev])
      return newTask
    } catch (err: any) {
      console.error('Error creating task:', err)
      setError(err.response?.data?.message || 'Error al crear tarea')
      throw err
    }
  }

  const updateTask = async (taskId: string, taskData: any) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData)
      const updatedTask = response.data.task
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
      return updatedTask
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar tarea')
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar tarea')
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  }
}
