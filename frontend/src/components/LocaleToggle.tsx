import { Check, Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Locale } from '@/lib/i18n/translations'
import { useTranslation } from '@/lib/i18n/useTranslation'

const LOCALES: { value: Locale; flag: string; label: string }[] = [
  { value: 'en', flag: '🇬🇧', label: 'English' },
  { value: 'fr', flag: '🇫🇷', label: 'Français' },
]

export function LocaleToggle() {
  const { locale, setLocale } = useTranslation()
  const current = LOCALES.find((option) => option.value === locale) ?? LOCALES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" aria-label={current.label} className="gap-1.5 px-2">
          <Globe aria-hidden className="size-4" />
          <span aria-hidden>{current.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => setLocale(option.value)}>
            <span aria-hidden>{option.flag}</span>
            <span className="flex-1">{option.label}</span>
            {option.value === locale && <Check aria-hidden className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
