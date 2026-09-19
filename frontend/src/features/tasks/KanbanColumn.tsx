import { useDroppable } from '@dnd-kit/core'

import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Task, TaskStatus } from '@/types/task'

import { TaskCard } from './TaskCard'

const COLUMN_STYLES: Record<TaskStatus, string> = {
  TODO: 'border-border bg-muted/40',
  IN_PROGRESS: 'border-cova-accent/25 bg-accent/50',
  DONE: 'border-primary/25 bg-primary/[0.06]',
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function KanbanColumn({ status, tasks, onView, onEdit, onDelete }: KanbanColumnProps) {
  const { t } = useTranslation()
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-64 min-w-0 flex-col gap-3 rounded-xl border p-3 transition-all ${COLUMN_STYLES[status]} ${
        isOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">{t(`task.status.${status}`)}</h2>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
