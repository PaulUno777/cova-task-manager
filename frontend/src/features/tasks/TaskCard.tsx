import { useDraggable } from '@dnd-kit/core'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import type { MouseEvent } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Task } from '@/types/task'

const STATUS_VARIANT: Record<Task['status'], 'outline' | 'secondary' | 'default'> = {
  TODO: 'outline',
  IN_PROGRESS: 'secondary',
  DONE: 'default',
}

interface TaskCardProps {
  task: Task
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskCard({ task, onView, onEdit, onDelete }: TaskCardProps) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  function stopPropagation(event: MouseEvent) {
    event.stopPropagation()
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : undefined}>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onView(task)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onView(task)
          }
        }}
        className="min-w-0 cursor-pointer gap-2 p-3 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex min-w-0 items-start gap-2">
          <button
            type="button"
            {...listeners}
            {...attributes}
            onClick={stopPropagation}
            aria-label={t('task.dragHandle')}
            className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical aria-hidden className="size-4" />
          </button>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="truncate text-sm font-medium text-foreground">{task.title}</h3>
            <Badge variant={STATUS_VARIANT[task.status]}>{t(`task.status.${task.status}`)}</Badge>
            {task.description && (
              <p className="line-clamp-2 break-words text-xs text-muted-foreground">{task.description}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t('task.edit')}
              onClick={(event) => {
                stopPropagation(event)
                onEdit(task)
              }}
            >
              <Pencil aria-hidden className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t('task.delete')}
              onClick={(event) => {
                stopPropagation(event)
                onDelete(task)
              }}
            >
              <Trash2 aria-hidden className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
