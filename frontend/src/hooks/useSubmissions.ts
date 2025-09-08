import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Submission } from '@/types'

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/submissions')
      const submissions = response.data.submissions || []
      // Mapear _id a id para compatibilidad
      const mappedSubmissions = submissions.map((submission: any) => ({
        ...submission,
        id: submission._id || submission.id,
        task: submission.task ? {
          ...submission.task,
          id: submission.task._id || submission.task.id,
          professor: submission.task.professor ? {
            ...submission.task.professor,
            id: submission.task.professor._id || submission.task.professor.id
          } : submission.task.professor,
          assignedTo: submission.task.assignedTo ? submission.task.assignedTo.map((user: any) => ({
            ...user,
            id: user._id || user.id
          })) : submission.task.assignedTo
        } : submission.task,
        student: submission.student ? {
          ...submission.student,
          id: submission.student._id || submission.student.id
        } : submission.student,
        gradedBy: submission.gradedBy ? {
          ...submission.gradedBy,
          id: submission.gradedBy._id || submission.gradedBy.id
        } : submission.gradedBy
      }))
      setSubmissions(mappedSubmissions)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar entregas')
      console.error('Error fetching submissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSubmission = async (submissionData: any) => {
    try {
      const response = await api.post('/submissions', submissionData)
      const newSubmission = response.data.submission
      setSubmissions(prev => [newSubmission, ...prev])
      return newSubmission
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear entrega')
      throw err
    }
  }

  const updateSubmission = async (submissionId: string, submissionData: any) => {
    try {
      const response = await api.put(`/submissions/${submissionId}`, submissionData)
      const updatedSubmission = response.data.submission
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId ? updatedSubmission : submission
      ))
      return updatedSubmission
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar entrega')
      throw err
    }
  }

  const gradeSubmission = async (submissionId: string, score: number, feedback?: string) => {
    try {
      const response = await api.patch(`/submissions/${submissionId}/grade`, {
        score,
        feedback
      })
      const gradedSubmission = response.data.submission
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId ? gradedSubmission : submission
      ))
      return gradedSubmission
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al calificar entrega')
      throw err
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  return {
    submissions,
    loading,
    error,
    fetchSubmissions,
    createSubmission,
    updateSubmission,
    gradeSubmission
  }
}
