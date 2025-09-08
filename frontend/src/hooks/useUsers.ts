import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { User } from '@/types'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async (role?: string) => {
    try {
      setLoading(true)
      setError(null)
      const url = role ? `/users?role=${role}` : '/users'
      const response = await api.get(url)
      const users = response.data.users || []
      // Mapear _id a id para compatibilidad
      const mappedUsers = users.map((user: any) => ({
        ...user,
        id: user._id || user.id
      }))
      setUsers(mappedUsers)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    return fetchUsers('student')
  }

  const fetchProfessors = async () => {
    return fetchUsers('professor')
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchStudents,
    fetchProfessors
  }
}
