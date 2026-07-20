import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import api from '@/services/api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no encontrado en la URL.')
      return
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success')
        setMessage(res.data?.message || 'Email verificado correctamente')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err?.response?.data?.message || 'Error al verificar el email')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border p-8 text-center"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
        {status === 'loading' && (
          <div className="py-8">
            <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--em)' }} />
            <p style={{ color: 'var(--txt2)' }}>Verificando tu email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#10B981' }} />
            <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--txt)' }}>
              Email verificado
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>{message}</p>
            <Link to="/login"
              className="inline-block px-6 py-2.5 rounded-xl font-display font-bold text-sm transition-all"
              style={{ background: 'var(--em)', color: '#000' }}>
              Ir a iniciar sesión
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <XCircle size={48} className="mx-auto mb-4" style={{ color: '#F87171' }} />
            <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--txt)' }}>
              Error de verificación
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--txt2)' }}>{message}</p>
            <Link to="/"
              className="inline-block px-6 py-2.5 rounded-xl font-display font-bold text-sm transition-all"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt2)' }}>
              Volver al inicio
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
