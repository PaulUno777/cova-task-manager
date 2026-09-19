import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateTaskRequest, UpdateTaskRequest } from '@/types/task'

import * as tasksApi from './api'
import type { ListTasksParams } from './api'

export function useTasksQuery(params: ListTasksParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksApi.listTasks(params),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateTaskRequest) => tasksApi.createTask(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateTaskRequest }) => tasksApi.updateTask(id, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tasksApi.deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
