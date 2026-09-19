import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/useTranslation'

import { DeleteTaskDialog } from './DeleteTaskDialog'
import { TaskDetailDialog } from './TaskDetailDialog'
import { TaskFilters } from './TaskFilters'
import { TaskFormDialog } from './TaskFormDialog'
import { TaskList } from './TaskList'
import { useTaskDashboard } from './useTaskDashboard'

export function TaskDashboardPage() {
  const { t } = useTranslation()
  const dashboard = useTaskDashboard()

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{t('dashboard.title')}</h1>
        <Button variant="cova" onClick={dashboard.openCreate}>
          <Plus aria-hidden className="size-4" />
          {t('dashboard.newTask')}
        </Button>
      </div>

      <TaskFilters
        search={dashboard.search}
        onSearchChange={dashboard.setSearch}
        status={dashboard.status}
        onStatusChange={dashboard.setStatus}
      />

      <TaskList
        tasks={dashboard.tasks}
        isLoading={dashboard.isLoading}
        isError={dashboard.isError}
        hasActiveFilters={dashboard.hasActiveFilters}
        statusFilter={dashboard.status}
        onRetry={dashboard.retry}
        onCreate={dashboard.openCreate}
        onView={dashboard.setViewingTask}
        onEdit={dashboard.openEdit}
        onDelete={dashboard.setDeletingTask}
        onStatusChange={dashboard.changeStatus}
      />

      <TaskFormDialog open={dashboard.formOpen} onOpenChange={dashboard.setFormOpen} task={dashboard.editingTask} />
      <TaskDetailDialog
        task={dashboard.viewingTask}
        onOpenChange={(open) => !open && dashboard.setViewingTask(null)}
        onEdit={dashboard.openEdit}
      />
      <DeleteTaskDialog
        task={dashboard.deletingTask}
        onOpenChange={(open) => !open && dashboard.setDeletingTask(null)}
      />
    </div>
  )
}
