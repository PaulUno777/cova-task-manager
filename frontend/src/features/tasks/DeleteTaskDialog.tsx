import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ApiRequestError } from '@/lib/api-client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Task } from '@/types/task'

import { useDeleteTask } from './useTasks'

interface DeleteTaskDialogProps {
  task: Task | null
  onOpenChange: (open: boolean) => void
}

export function DeleteTaskDialog({ task, onOpenChange }: DeleteTaskDialogProps) {
  const { t } = useTranslation()
  const deleteTask = useDeleteTask()

  async function handleConfirm() {
    if (!task) return
    try {
      await deleteTask.mutateAsync(task.id)
      toast.success(t('task.deletedToast'))
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : t('common.error'))
    }
  }

  return (
    <Dialog open={Boolean(task)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('task.delete.title')}</DialogTitle>
          <DialogDescription>{t('task.delete.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteTask.isPending}>
            {t('task.delete.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
