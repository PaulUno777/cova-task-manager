import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/useTranslation'

const DISMISSED_KEY = 'cova-pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPwaBanner() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1')

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  if (!deferredPrompt || dismissed) return null

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:max-w-sm">
      <Download aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-foreground">{t('pwa.installTitle')}</p>
        <p className="text-muted-foreground">{t('pwa.installBody')}</p>
        <Button size="sm" variant="cova" className="mt-3" onClick={handleInstall}>
          {t('pwa.install')}
        </Button>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t('common.close')}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  )
}
