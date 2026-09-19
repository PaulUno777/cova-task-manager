import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/useAuth'
import { TaskDashboardPage } from '@/features/tasks/TaskDashboardPage'
import { useTranslation } from '@/lib/i18n/useTranslation'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
const API_DOCS_URL = `${API_BASE_URL.replace(/\/api\/?$/, '')}/swagger-ui.html`

export function HomePage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  if (user) return <TaskDashboardPage />

  const features = [
    { title: t('hero.feature.security.title'), body: t('hero.feature.security.body') },
    { title: t('hero.feature.explore.title'), body: t('hero.feature.explore.body') },
    { title: t('hero.feature.workflow.title'), body: t('hero.feature.workflow.body') },
  ]

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl space-y-6 text-left">
        <p className="inline-flex rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
          {t('hero.badge')}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t('hero.title')}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('hero.description')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="cova">
            <Link to="/register">{t('hero.getStarted')}</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={API_DOCS_URL} target="_blank" rel="noreferrer">
              {t('hero.viewApiDocs')}
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {features.map((item) => (
          <article key={item.title} className="rounded-xl border border-border bg-muted/40 p-5 text-left">
            <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
