import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiRequestError } from '@/lib/api-client'
import { useTranslation } from '@/lib/i18n/useTranslation'

import { useAuth } from './useAuth'

export function RegisterPage() {
  const { user, register } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (password.length < 8) {
      setFieldErrors({ password: t('auth.password.tooShort') })
      return
    }
    setFieldErrors({})
    setSubmitting(true)
    try {
      await register(email, password)
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors(error.fields ?? {})
        toast.error(error.message)
      } else {
        toast.error(t('common.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('auth.register.title')}</CardTitle>
          <CardDescription>{t('auth.register.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              {fieldErrors.password ? (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{t('auth.password.hint')}</p>
              )}
            </div>
            <Button type="submit" variant="cova" className="w-full" disabled={submitting}>
              {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
