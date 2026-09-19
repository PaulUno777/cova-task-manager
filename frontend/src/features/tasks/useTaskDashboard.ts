import { useState } from 'react'
import { toast } from 'sonner'

import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ApiRequestError } from '@/lib/api-client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Task, TaskStatus } from '@/types/task'

import { useTasksQuery, useUpdateTask } from './useTasks'

const MIN_SEARCH_LENGTH = 2

export function useTaskDashboard() {
  const { t } = useTranslation()
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined)

  const debouncedSearch = useDebouncedValue(search, 300)
  const effectiveSearch = debouncedSearch.length >= MIN_SEARCH_LENGTH ? debouncedSearch : undefined
  const hasActiveFilters = Boolean(effectiveSearch) || Boolean(status)

  const { data, isLoading, isError, refetch } = useTasksQuery({
    search: effectiveSearch,
    status,
    page: 0,
    size: 100,
  })

  const updateTask = useUpdateTask()

  function openCreate() {
    setEditingTask(null)
    setFormOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setFormOpen(true)
  }

  async function changeStatus(task: Task, nextStatus: TaskStatus) {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        request: { title: task.title, description: task.description ?? undefined, status: nextStatus },
      })
      toast.success(t('task.updatedToast'))
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : t('common.error'))
    }
  }

  return {
    tasks: data?.content,
    isLoading,
    isError,
    hasActiveFilters,
    search,
    setSearch,
    status,
    setStatus,
    formOpen,
    setFormOpen,
    editingTask,
    deletingTask,
    setDeletingTask,
    viewingTask,
    setViewingTask,
    openCreate,
    openEdit,
    changeStatus,
    retry: () => refetch(),
  }
}
