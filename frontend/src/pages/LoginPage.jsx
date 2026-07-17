import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Zap, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { NexaIcon }     from '@/components/ui/NexaIcon'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()

  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Completá todos los campos.')
      return
    }
    const result = await login(form.email, form.password)
    if (result.success) {
      navigate(result.redirect || '/dashboard')
    } else {
      setError(result.message || 'Credenciales incorrectas.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-bg-primary relative overflow-hidden"
      aria-label="Página de inicio de sesión"
    >
      {/* Background glow */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[420px] relative"
      >
        {/* Card */}
        <div
          className="rounded-2xl px-8 py-9"
          style={{
            background:  'var(--bg2)',
            border:      '1px solid var(--border2)',
            boxShadow:   '0 24px 80px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8" aria-hidden="true">
            <NexaIcon size={34} className="flex-shrink-0" />
            <span className="font-display font-bold text-lg text-txt-primary">
              Nexa<span className="text-em">Panel</span>
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl text-txt-primary mb-1.5" style={{ letterSpacing: '-0.5px' }}>
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-txt-secondary mb-7">
            Ingresá a tu panel para gestionar tus órdenes.
          </p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border:     '1px solid rgba(239,68,68,0.2)',
                  color:      '#FCA5A5',
                }}
              >
                <AlertCircle size={14} className="flex-shrink-0" aria-hidden="true" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="tu@email.com"
              icon={Mail}
              autoComplete="email"
              disabled={isLoading}
            />

            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              icon={Lock}
              autoComplete="current-password"
              disabled={isLoading}
            />

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : { scale: 1.02 }}
              whileTap={isLoading  ? {} : { scale: 0.98 }}
              className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold font-sans transition-all disabled:cursor-not-allowed"
              style={{
                background: 'var(--em)',
                color:      '#000',
                opacity:    isLoading ? 0.7 : 1,
              }}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(0,0,0,0.3)', borderTopColor: '#000' }}
                    aria-hidden="true"
                  />
                  Ingresando…
                </>
              ) : (
                <>
                  <Zap size={15} aria-hidden="true" />
                  Iniciar sesión
                  <ArrowRight size={14} aria-hidden="true" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-sm text-txt-muted">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-em-3 font-semibold hover:underline">
              Registrate gratis
            </Link>
          </p>
        </div>

        <p className="text-center mt-5 text-xs text-txt-muted">
          <Link to="/" className="hover:text-txt-secondary transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
