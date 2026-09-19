import { apiFetch } from '@/lib/api-client'
import type { CreateTaskRequest, PageResponse, Task, TaskStatus, UpdateTaskRequest } from '@/types/task'

export interface ListTasksParams {
  status?: TaskStatus
  search?: string
  page?: number
  size?: number
}

export function listTasks(params: ListTasksParams) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.search) query.set('search', params.search)
  query.set('page', String(params.page ?? 0))
  query.set('size', String(params.size ?? 20))

  return apiFetch<PageResponse<Task>>(`/tasks?${query.toString()}`)
}

export function createTask(request: CreateTaskRequest) {
  return apiFetch<Task>('/tasks', { method: 'POST', body: request })
}

export function updateTask(id: number, request: UpdateTaskRequest) {
  return apiFetch<Task>(`/tasks/${id}`, { method: 'PUT', body: request })
}

export function deleteTask(id: number) {
  return apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' })
}
