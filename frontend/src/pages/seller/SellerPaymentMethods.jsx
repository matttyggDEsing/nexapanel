import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Bitcoin, Landmark, Wallet, CheckCircle2, XCircle, Copy, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { sellerService } from '@/services/sellerService'

// Metadatos visuales para las claves de método conocidas.
// Cualquier clave no listada cae en el fallback genérico.
const METHOD_META = {
  manual:        { label: 'Transferencia Manual', icon: Landmark,   color: '#60A5FA' },
  transferencia: { label: 'Transferencia',         icon: Landmark,   color: '#60A5FA' },
  mercadopago:   { label: 'Mercado Pago',          icon: Wallet,     color: '#00B1EA' },
  crypto:        { label: 'Criptomonedas',         icon: Bitcoin,    color: '#F59E0B' },
  paypal:        { label: 'PayPal',                icon: CreditCard, color: '#A78BFA' },
  stripe:        { label: 'Tarjeta (Stripe)',      icon: CreditCard, color: '#818CF8' },
  efectivo:      { label: 'Efectivo',              icon: Wallet,     color: '#34D399' },
  otro:          { label: 'Otro',                  icon: CreditCard, color: 'var(--txt2)' },
}

// Campos sensibles que se enmascaran en pantalla
const MASKED_FIELDS = ['secret_key', 'private_key', 'api_secret']

function fieldLabel(key) {
  const map = {
    address: 'Dirección', network: 'Red', email: 'Email',
    instructions: 'Instrucciones', public_key: 'Clave pública',
    secret_key: 'Clave secreta', alias: 'Alias', cbu: 'CBU',
    holder: 'Titular', bank: 'Banco', private_key: 'Clave privada',
    api_secret: 'API secret', wallet: 'Wallet',
  }
  return map[key] || key.replace(/_/g, ' ')
}

function maskValue(value) {
  if (!value) return ''
  const str = String(value)
  if (str.length <= 6) return '••••••'
  return `${str.slice(0, 3)}••••${str.slice(-3)}`
}

function copy(value) {
  navigator.clipboard?.writeText(String(value))
  toast.success('Copiado al portapapeles')
}

function MethodCard({ methodKey, data, delay }) {
  const meta = METHOD_META[methodKey] || { label: methodKey.replace(/_/g, ' '), icon: CreditCard, color: 'var(--txt2)' }
  const Icon = meta.icon
  const enabled = !!data?.enabled
  const fields = Object.entries(data || {}).filter(([k]) => k !== 'enabled')

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}
      className="rounded-2xl border p-5"
      style={{
        background: 'var(--bg2)',
        borderColor: enabled ? 'rgba(16,185,129,0.2)' : 'var(--border2)',
        opacity: enabled ? 1 : 0.65,
      }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
            <Icon size={18} style={{ color: meta.color }} />
          </div>
          <div>
            <p className="font-display font-semibold text-sm" style={{ color: 'var(--txt)' }}>{meta.label}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--txt3)' }}>{methodKey}</p>
          </div>
        </div>
        {enabled ? (
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--em3)' }}>
            <CheckCircle2 size={12} /> Activo
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#FCA5A5' }}>
            <XCircle size={12} /> Inactivo
          </span>
        )}
      </div>

      {fields.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--txt3)' }}>Sin configuración adicional.</p>
      ) : (
        <div className="space-y-2">
          {fields.map(([key, value]) => {
            if (!value) return null
            const masked = MASKED_FIELDS.includes(key)
            return (
              <div key={key} className="flex items-center justify-between gap-3 py-1.5 border-t"
                style={{ borderColor: 'var(--border2)' }}>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--txt3)' }}>{fieldLabel(key)}</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs truncate font-mono" style={{ color: 'var(--txt2)', maxWidth: 180 }}>
                    {masked ? maskValue(value) : String(value)}
                  </span>
                  {!masked && (
                    <button onClick={() => copy(value)} className="flex-shrink-0" style={{ color: 'var(--txt3)' }}>
                      <Copy size={11} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default function SellerPaymentMethods() {
  const [methods, setMethods] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await sellerService.getPaymentMethods()
      setMethods(res.data?.data || {})
    } catch (_) {
      setMethods({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const entries = methods ? Object.entries(methods) : []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
            Métodos de Pago
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--txt2)' }}>
            Configurados por el administrador. Solo lectura.
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="p-2 rounded-xl transition-all"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt2)' }}>
          <motion.div animate={{ rotate: loading ? 360 : 0 }} transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}>
            <RefreshCw size={15} />
          </motion.div>
        </button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--txt3)' }}>
          <CreditCard size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">El administrador todavía no configuró métodos de pago.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map(([key, data], i) => (
            <MethodCard key={key} methodKey={key} data={data} delay={i * 0.05} />
          ))}
        </div>
      )}

      <p className="text-xs text-center pt-2" style={{ color: 'var(--txt3)' }}>
        ¿Necesitás agregar o modificar un método de pago? Contactá a un administrador.
      </p>
    </div>
  )
}
