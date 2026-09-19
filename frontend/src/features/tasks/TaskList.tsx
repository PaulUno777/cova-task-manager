import { AlertCircle, ClipboardList } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Task, TaskStatus } from '@/types/task'

import { KanbanBoard } from './KanbanBoard'

interface TaskListProps {
  tasks: Task[] | undefined
  isLoading: boolean
  isError: boolean
  hasActiveFilters: boolean
  statusFilter: TaskStatus | undefined
  onRetry: () => void
  onCreate: () => void
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
}

export function TaskList({
  tasks,
  isLoading,
  isError,
  hasActiveFilters,
  statusFilter,
  onRetry,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, columnIndex) => (
          <div key={columnIndex} className="flex min-h-64 flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle aria-hidden className="size-4" />
        <AlertTitle>{t('dashboard.loadError')}</AlertTitle>
        <AlertDescription>
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
        <ClipboardList aria-hidden className="size-10 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {hasActiveFilters ? t('dashboard.noResults') : t('dashboard.empty.title')}
          </p>
          {!hasActiveFilters && <p className="text-sm text-muted-foreground">{t('dashboard.empty.body')}</p>}
        </div>
        {!hasActiveFilters && (
          <Button variant="cova" onClick={onCreate}>
            {t('dashboard.empty.cta')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <KanbanBoard
      tasks={tasks}
      statusFilter={statusFilter}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onStatusChange={onStatusChange}
    />
  )
}
