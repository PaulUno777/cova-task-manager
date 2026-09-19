import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateTaskRequest, PageResponse, Task, UpdateTaskRequest } from '@/types/task'

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
    onMutate: async ({ id, request }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousQueries = queryClient.getQueriesData<PageResponse<Task>>({ queryKey: ['tasks'] })
      queryClient.setQueriesData<PageResponse<Task>>({ queryKey: ['tasks'] }, (page) => {
        if (!page) return page
        return {
          ...page,
          content: page.content.map((task) =>
            task.id === id ? { ...task, ...request, description: request.description ?? null } : task,
          ),
        }
      })
      return { previousQueries }
    },
    onError: (_error, _variables, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tasksApi.deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousQueries = queryClient.getQueriesData<PageResponse<Task>>({ queryKey: ['tasks'] })
      queryClient.setQueriesData<PageResponse<Task>>({ queryKey: ['tasks'] }, (page) => {
        if (!page) return page
        return { ...page, content: page.content.filter((task) => task.id !== id) }
      })
      return { previousQueries }
    },
    onError: (_error, _variables, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
