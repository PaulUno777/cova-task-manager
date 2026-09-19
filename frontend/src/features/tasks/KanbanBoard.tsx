import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'

import type { Task, TaskStatus } from '@/types/task'

import { KanbanColumn } from './KanbanColumn'

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']

interface KanbanBoardProps {
  tasks: Task[]
  statusFilter: TaskStatus | undefined
  onView: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
}

export function KanbanBoard({ tasks, statusFilter, onView, onEdit, onDelete, onStatusChange }: KanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const columns = statusFilter ? [statusFilter] : STATUSES

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const task = active.data.current?.task as Task | undefined
    const newStatus = over.id as TaskStatus
    if (task && task.status !== newStatus) {
      onStatusChange(task, newStatus)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={`grid gap-4 ${columns.length > 1 ? 'sm:grid-cols-3' : 'sm:max-w-sm'}`}>
        {columns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  )
}
