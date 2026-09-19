import { Loader2 } from 'lucide-react'
import { useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiRequestError } from '@/lib/api-client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Task, TaskStatus } from '@/types/task'

import { useCreateTask, useUpdateTask } from './useTasks'

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
}

export function TaskFormDialog({ open, onOpenChange, task }: TaskFormDialogProps) {
  const { t } = useTranslation()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const isEditing = Boolean(task)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Reset the form when the dialog transitions to open, for whichever task it opened with.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setTitle(task?.title ?? '')
      setDescription(task?.description ?? '')
      setStatus(task?.status ?? 'TODO')
      setFieldErrors({})
    }
  }

  const submitting = createTask.isPending || updateTask.isPending

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setFieldErrors({})
    try {
      if (isEditing && task) {
        await updateTask.mutateAsync({
          id: task.id,
          request: { title, description: description || undefined, status },
        })
        toast.success(t('task.updatedToast'))
      } else {
        await createTask.mutateAsync({ title, description: description || undefined, status })
        toast.success(t('task.createdToast'))
      }
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors(error.fields ?? {})
        toast.error(error.message)
      } else {
        toast.error(t('common.error'))
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('task.form.editTitle') : t('task.form.createTitle')}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="task-title">{t('task.form.title')}</Label>
            <Input
              id="task-title"
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(fieldErrors.title)}
            />
            {fieldErrors.title && <p className="text-sm text-destructive">{fieldErrors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">{t('task.form.descriptionOptional')}</Label>
            <Textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-status">{t('task.form.status')}</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
              <SelectTrigger id="task-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`task.status.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" variant="cova" disabled={submitting}>
              {submitting && <Loader2 aria-hidden className="size-4 animate-spin" />}
              {submitting
                ? isEditing
                  ? t('task.form.saving')
                  : t('task.form.creating')
                : isEditing
                  ? t('task.form.save')
                  : t('task.form.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
