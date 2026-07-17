import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Zap, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { NexaIcon } from '@/components/ui/NexaIcon'

const PERKS = [
  'Panel SMM completo sin costo inicial',
  '+30 plataformas soportadas',
  'API pública incluida',
  'Soporte 24/7 por tickets',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Completá todos los campos.')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const result = await register(form.name, form.email, form.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message || 'Error al registrarse. Intentá nuevamente.')
    }
  }

  const pwStrength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8)  s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][pwStrength]
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'][pwStrength]

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'stretch',
      background: 'var(--bg)', overflow: 'hidden',
    }}>
      {/* Left panel — perks (hidden on mobile) */}
      <div style={{
        display: 'none',
        flex: 1, padding: '48px 48px', flexDirection: 'column', justifyContent: 'center',
        background: 'var(--bg2)', borderRight: '1px solid var(--border2)',
        position: 'relative', overflow: 'hidden',
      }}
      className="md-left-panel"
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
            <NexaIcon size={32} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--txt)' }}>
              Nexa<span style={{ color: 'var(--em)' }}>Panel</span>
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 32,
            letterSpacing: '-1px', color: 'var(--txt)', marginBottom: 14, lineHeight: 1.15,
          }}>
            Empezá gratis.<br />Crecé sin límites.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--txt2)', marginBottom: 40, lineHeight: 1.7 }}>
            El panel SMM más completo para gestionar tus redes sociales en un solo lugar.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PERKS.map(perk => (
              <li key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--txt2)' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={12} style={{ color: 'var(--em3)' }} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow mobile */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: '100%', maxWidth: 420, position: 'relative' }}
        >
          {/* Logo (mobile only) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <NexaIcon size={30} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--txt)' }}>
              Nexa<span style={{ color: 'var(--em)' }}>Panel</span>
            </span>
          </div>

          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border2)',
            borderRadius: 20, padding: '32px 28px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          }}>
            <h1 style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22,
              color: 'var(--txt)', letterSpacing: '-0.4px', marginBottom: 6,
            }}>
              Crear cuenta
            </h1>
            <p style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 24 }}>
              Completá el formulario para empezar en segundos.
            </p>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  borderRadius: 10, background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)', marginBottom: 18,
                  fontSize: 13, color: '#FCA5A5',
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />{error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FField label="Nombre completo" type="text"   value={form.name}     onChange={set('name')}     placeholder="Tu Nombre"       icon={User}  focused={focused === 'name'}     onFocus={() => setFocused('name')}     onBlur={() => setFocused('')} />
              <FField label="Email"            type="email" value={form.email}    onChange={set('email')}    placeholder="tu@email.com"    icon={Mail}  focused={focused === 'email'}    onFocus={() => setFocused('email')}    onBlur={() => setFocused('')} />
              <FField label="Contraseña"       type="password" value={form.password} onChange={set('password')} placeholder="Mín. 8 caracteres" icon={Lock}  focused={focused === 'pw'}      onFocus={() => setFocused('pw')}       onBlur={() => setFocused('')} />

              {/* Strength bar */}
              {form.password.length > 0 && (
                <div style={{ marginTop: -6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} style={{
                        flex: 1, height: 3, borderRadius: 2, transition: 'background .3s',
                        background: n <= pwStrength ? strengthColor : 'var(--bg4)',
                      }} />
                    ))}
                  </div>
                  {strengthLabel && (
                    <p style={{ fontSize: 11, color: strengthColor, marginTop: 4 }}>Contraseña {strengthLabel}</p>
                  )}
                </div>
              )}

              <FField label="Confirmar contraseña" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repetí tu contraseña" icon={Lock} focused={focused === 'confirm'} onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')} />

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={isLoading ? {} : { scale: 1.02 }}
                whileTap={isLoading ? {} : { scale: 0.98 }}
                style={{
                  marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, width: '100%', padding: '12px', borderRadius: 11,
                  fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  background: 'var(--em)', color: '#000', border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1, transition: 'background .15s',
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Creando cuenta…
                  </>
                ) : (
                  <><Zap size={15} /> Crear cuenta gratis <ArrowRight size={14} /></>
                )}
              </motion.button>

              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>
                Al registrarte aceptás nuestros{' '}
                <a href="#" style={{ color: 'var(--txt2)', textDecoration: 'none' }}>Términos de uso</a>
                {' '}y{' '}
                <a href="#" style={{ color: 'var(--txt2)', textDecoration: 'none' }}>Política de privacidad</a>.
              </p>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--txt3)' }}>
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" style={{ color: 'var(--em3)', textDecoration: 'none', fontWeight: 600 }}>
                Iniciar sesión
              </Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--txt3)' }}>
            <Link to="/" style={{ color: 'var(--txt3)', textDecoration: 'none' }}>← Volver al inicio</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function FField({ label, type, value, onChange, placeholder, icon: Icon, focused, onFocus, onBlur }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--txt2)' }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: focused ? 'rgba(16,185,129,0.04)' : 'var(--bg4)',
        borderRadius: 12,
        border: `1px solid ${focused ? 'rgba(16,185,129,0.40)' : 'rgba(16,185,129,0.12)'}`,
        boxShadow: focused ? '0 0 0 12px rgba(16,185,129,0.06), 0 0 0 1px rgba(16,185,129,0.20)' : 'none',
        transition: 'border-color .2s, box-shadow .2s',
      }}>
        <div style={{ paddingLeft: 12, display: 'flex', alignItems: 'center', color: focused ? 'var(--em3)' : 'var(--txt3)', transition: 'color .2s', flexShrink: 0 }}>
          <Icon size={14} />
        </div>
        <input
          type={inputType} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={onFocus} onBlur={onBlur}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--txt)', fontSize: 13, padding: '9px 10px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(v => !v)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0 11px',
            color: 'var(--txt3)', fontSize: 11, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {show ? 'Ocultar' : 'Ver'}
          </button>
        )}
      </div>
    </div>
  )
}
