import { CheckSquare, LogOut } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { LocaleToggle } from '@/components/LocaleToggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/useAuth'
import { useTranslation } from '@/lib/i18n/useTranslation'

export function AppShell() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
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
          </Link>

          <nav aria-label="Main" className="flex flex-wrap items-center gap-2 sm:gap-3">
            <LocaleToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={user.email}
                    className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('nav.memberSince', { date: new Date(user.createdAt).toLocaleDateString() })}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={logout} variant="destructive">
                    <LogOut aria-hidden className="size-4" />
                    {t('nav.logOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">{t('nav.signIn')}</Link>
                </Button>
                <Button asChild variant="cova">
                  <Link to="/register">{t('nav.getStarted')}</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
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
