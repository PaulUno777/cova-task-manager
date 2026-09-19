import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Task } from '@/types/task'

const STATUS_VARIANT: Record<Task['status'], 'outline' | 'secondary' | 'default'> = {
  TODO: 'outline',
  IN_PROGRESS: 'secondary',
  DONE: 'default',
}

interface TaskDetailDialogProps {
  task: Task | null
  onOpenChange: (open: boolean) => void
  onEdit: (task: Task) => void
}

export function TaskDetailDialog({ task, onOpenChange, onEdit }: TaskDetailDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={Boolean(task)} onOpenChange={onOpenChange}>
      <DialogContent>
        {task && (
          <>
            <DialogHeader>
              <DialogTitle className="break-words pr-6">{task.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Badge variant={STATUS_VARIANT[task.status]}>{t(`task.status.${task.status}`)}</Badge>
              {task.description ? (
                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{task.description}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">{t('task.detail.noDescription')}</p>
              )}
              <div className="space-y-0.5 text-xs text-muted-foreground">
                <p>{t('task.detail.createdAt', { date: new Date(task.createdAt).toLocaleString() })}</p>
                <p>{t('task.detail.updatedAt', { date: new Date(task.updatedAt).toLocaleString() })}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.close')}
              </Button>
              <Button
                variant="cova"
                onClick={() => {
                  onEdit(task)
                  onOpenChange(false)
                }}
              >
                {t('task.edit')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
