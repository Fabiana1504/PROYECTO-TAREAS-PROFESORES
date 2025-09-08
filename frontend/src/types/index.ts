export interface User {
  id: string
  name: string
  email: string
  role: 'professor' | 'student'
  avatar?: string
  lastLogin?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Task {
  id: string
  title: string
  description: string
  professor: User
  assignedTo: User[]
  dueDate: string
  status: 'draft' | 'published' | 'closed'
  maxScore: number
  attachments: Attachment[]
  instructions?: string
  tags: string[]
  isOverdue?: boolean
  createdAt: string
  updatedAt: string
}

export interface Submission {
  id: string
  task: Task
  student: User
  content: string
  attachments: Attachment[]
  status: 'submitted' | 'graded' | 'returned'
  score?: number
  feedback?: string
  gradedBy?: User
  gradedAt?: string
  isLate: boolean
  gradePercentage?: number
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  filename: string
  originalName: string
  path: string
  size: number
  uploadedAt: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalPages: number
  currentPage: number
  total: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'professor' | 'student'
}

export interface CreateTaskRequest {
  title: string
  description: string
  assignedTo: string[]
  dueDate: string
  maxScore?: number
  instructions?: string
  tags?: string[]
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: 'draft' | 'published' | 'closed'
}

export interface CreateSubmissionRequest {
  task: string
  content?: string
}

export interface GradeSubmissionRequest {
  score: number
  feedback?: string
}
