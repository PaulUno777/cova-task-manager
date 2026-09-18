import { CheckSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckSquare aria-hidden className="size-5" />
            </span>
            <div className="text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                COVA
              </p>
              <p className="text-lg font-semibold leading-tight text-foreground">
                Task Manager
              </p>
            </div>
          </div>

          <nav
            aria-label="Main"
            className="flex flex-wrap items-center gap-2 sm:gap-3"
          >
            <Button variant="ghost" disabled className="text-muted-foreground">
              Dashboard
            </Button>
            <Button variant="ghost" disabled className="text-muted-foreground">
              Sign in
            </Button>
            <Button variant="cova" disabled>
              Get started
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl space-y-6 text-left">
            <p className="inline-flex rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
              Phase 1 — application shell
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Organize your work with clarity
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              The COVA Task Manager web experience will live here: secure
              authentication, personal task lists, search, and status
              filtering. Backend and frontend foundations are in place; feature
              work starts next.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="default" disabled>
                Task dashboard coming next
              </Button>
              <Button variant="outline" disabled>
                View API docs
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Teal primary',
                body: 'Navigation, links, and primary actions use COVA teal.',
              },
              {
                title: 'Orange accent',
                body: 'Highlights and key calls-to-action use warm orange.',
              },
              {
                title: 'Responsive shell',
                body: 'Layout adapts from mobile to desktop with consistent spacing.',
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-border bg-muted/40 p-5 text-left"
              >
                <h2 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-cova-neutral-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>COVA Task Manager</p>
          <p>Paulin Junior Nzodoum</p>
        </div>
      </footer>
    </div>
  )
}
