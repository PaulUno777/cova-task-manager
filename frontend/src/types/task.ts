export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
}

export interface UpdateTaskRequest {
  title: string
  description?: string
  status: TaskStatus
}

export interface ApiError {
  status: number
  message: string
  timestamp: string
  path: string
  fields?: Record<string, string>
}
