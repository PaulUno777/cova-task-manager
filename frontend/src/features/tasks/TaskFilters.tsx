import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { TaskStatus } from '@/types/task'

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']
const ALL_STATUSES = 'ALL'

interface TaskFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: TaskStatus | undefined
  onStatusChange: (value: TaskStatus | undefined) => void
}

export function TaskFilters({ search, onSearchChange, status, onStatusChange }: TaskFiltersProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      <div className="relative max-w-sm flex-1">
        <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('filters.searchPlaceholder')}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={status ?? ALL_STATUSES}
        onValueChange={(value) => onStatusChange(value === ALL_STATUSES ? undefined : (value as TaskStatus))}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUSES}>{t('filters.allStatuses')}</SelectItem>
          {STATUSES.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`task.status.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
