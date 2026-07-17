import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Globe, DollarSign, CreditCard, Wrench, Save, ToggleLeft, ToggleRight, AlertTriangle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

const SECTIONS = [
  { id: 'general',     icon: Globe,      label: 'General'         },
  { id: 'payments',    icon: CreditCard, label: 'Pagos'           },
  { id: 'rates',       icon: DollarSign, label: 'Tasas de cambio' },
  { id: 'maintenance', icon: Wrench,     label: 'Mantenimiento'   },
]

const DEFAULT_SETTINGS = {
  // general
  site_name: 'NexaPanel', site_url: '', support_email: '', currency: 'USD',
  min_deposit: 1, max_deposit: 10000, registration_enabled: true, email_verification: false,
  // payments
  payment_methods: { crypto: { enabled: false, address: '', network: '' }, paypal: { enabled: false, email: '' }, stripe: { enabled: false, public_key: '', secret_key: '' }, manual: { enabled: true, instructions: '' } },
  // rates
  exchange_rates: { USD: 1, ARS: 1000, BRL: 5, EUR: 0.92 },
  // maintenance
  maintenance_mode: { enabled: false, message: 'El panel está en mantenimiento. Volvemos pronto.' },
}

export default function AdminSettings() {
  const [section, setSection]   = useState('general')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/settings')
      const d = data?.data ?? {}
      setSettings(prev => ({
        ...prev,
        ...(d.general             ?? {}),
        payment_methods:  d.payment_methods  ?? prev.payment_methods,
        exchange_rates:   d.exchange_rates   ?? prev.exchange_rates,
        maintenance_mode: d.maintenance_mode ?? prev.maintenance_mode,
      }))
    } catch {
      // usa defaults
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const set = (k, v) => setSettings(prev => ({ ...prev, [k]: v }))
  const setNested = (key, subKey, value) =>
    setSettings(prev => ({ ...prev, [key]: { ...prev[key], [subKey]: value } }))
  const setDeepNested = (key, subKey, field, value) =>
    setSettings(prev => ({ ...prev, [key]: { ...prev[key], [subKey]: { ...prev[key][subKey], [field]: value } } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {}

      if (section === 'general') {
        payload.general = {
          site_name: settings.site_name,
          site_url: settings.site_url,
          support_email: settings.support_email,
          currency: settings.currency,
          min_deposit: settings.min_deposit,
          max_deposit: settings.max_deposit,
          registration_enabled: settings.registration_enabled,
          email_verification: settings.email_verification,
        }
      } else if (section === 'payments') {
        payload.payment_methods = settings.payment_methods
      } else if (section === 'rates') {
        payload.exchange_rates = settings.exchange_rates
      } else if (section === 'maintenance') {
        payload.maintenance_mode = settings.maintenance_mode
      }

      await api.patch('/admin/settings', payload)
      toast.success('Configuración guardada correctamente')
      await fetchSettings()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const ToggleSwitch = ({ value, onChange, label, desc }) => (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium" style={{ color:'var(--txt)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color:'var(--txt3)' }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)} className="flex-shrink-0 mt-0.5"
        style={{ color: value ? 'var(--em)' : 'var(--txt3)' }}>
        {value ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
      </button>
    </div>
  )

  const Field = ({ label, value, onChange, type='text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--txt2)' }}>{label}</label>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt)' }}
        onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
        onBlur={e => e.target.style.borderColor='var(--border2)'}/>
    </div>
  )

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background:'var(--bg4)' }}/>
      ))}
    </div>
  )

  const renderSection = () => {
    switch (section) {
      case 'general': return (
        <div className="space-y-4">
          <h3 className="font-display font-semibold" style={{ color:'var(--txt)' }}>Configuración general</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre del sitio"   value={settings.site_name}      onChange={v => set('site_name', v)}      placeholder="NexaPanel"/>
            <Field label="URL del sitio"       value={settings.site_url}       onChange={v => set('site_url', v)}       placeholder="https://..."/>
            <Field label="Email de soporte"   value={settings.support_email}   onChange={v => set('support_email', v)}  placeholder="soporte@..."/>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--txt2)' }}>Moneda base</label>
              <select value={settings.currency} onChange={e => set('currency', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
                {['USD','EUR','ARS','BRL'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Field label="Depósito mínimo (USD)" type="number" value={settings.min_deposit} onChange={v => set('min_deposit', Number(v))} placeholder="1"/>
            <Field label="Depósito máximo (USD)" type="number" value={settings.max_deposit} onChange={v => set('max_deposit', Number(v))} placeholder="10000"/>
          </div>
          <div className="rounded-xl border divide-y" style={{ borderColor:'var(--border2)' }}>
            <div className="px-4">
              <ToggleSwitch value={settings.registration_enabled} onChange={v => set('registration_enabled', v)}
                label="Registro de nuevos usuarios" desc="Permite que nuevos usuarios se registren"/>
            </div>
            <div className="px-4">
              <ToggleSwitch value={settings.email_verification} onChange={v => set('email_verification', v)}
                label="Verificación de email" desc="Requiere verificación al registrarse"/>
            </div>
          </div>
        </div>
      )

      case 'payments': return (
        <div className="space-y-4">
          <h3 className="font-display font-semibold" style={{ color:'var(--txt)' }}>Métodos de pago</h3>
          {Object.entries({
            manual: 'Transferencia Manual',
            crypto: 'Criptomonedas',
            paypal: 'PayPal',
            stripe: 'Stripe',
          }).map(([key, label]) => (
            <div key={key} className="rounded-xl border p-4 space-y-3" style={{ borderColor:'var(--border2)', background:'var(--bg3)' }}>
              <ToggleSwitch
                value={settings.payment_methods?.[key]?.enabled ?? false}
                onChange={v => setDeepNested('payment_methods', key, 'enabled', v)}
                label={label}/>
              {settings.payment_methods?.[key]?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {key === 'crypto' && <>
                    <Field label="Dirección" value={settings.payment_methods.crypto.address} onChange={v => setDeepNested('payment_methods','crypto','address',v)} placeholder="0x..."/>
                    <Field label="Red" value={settings.payment_methods.crypto.network} onChange={v => setDeepNested('payment_methods','crypto','network',v)} placeholder="TRC20, ERC20..."/>
                  </>}
                  {key === 'paypal' && <Field label="Email PayPal" value={settings.payment_methods.paypal.email} onChange={v => setDeepNested('payment_methods','paypal','email',v)} placeholder="tu@paypal.com"/>}
                  {key === 'stripe' && <>
                    <Field label="Clave pública" value={settings.payment_methods.stripe.public_key} onChange={v => setDeepNested('payment_methods','stripe','public_key',v)} placeholder="pk_..."/>
                    <Field label="Clave secreta" value={settings.payment_methods.stripe.secret_key} onChange={v => setDeepNested('payment_methods','stripe','secret_key',v)} placeholder="sk_..."/>
                  </>}
                  {key === 'manual' && <Field label="Instrucciones" value={settings.payment_methods.manual.instructions} onChange={v => setDeepNested('payment_methods','manual','instructions',v)} placeholder="Instrucciones de pago..."/>}
                </div>
              )}
            </div>
          ))}
        </div>
      )

      case 'rates': return (
        <div className="space-y-4">
          <h3 className="font-display font-semibold" style={{ color:'var(--txt)' }}>Tasas de cambio</h3>
          <p className="text-sm" style={{ color:'var(--txt2)' }}>Configura las tasas respecto a USD</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="USD → ARS" type="number" value={settings.exchange_rates?.ARS} onChange={v => setNested('exchange_rates','ARS',Number(v))} placeholder="1000"/>
            <Field label="USD → BRL" type="number" value={settings.exchange_rates?.BRL} onChange={v => setNested('exchange_rates','BRL',Number(v))} placeholder="5"/>
            <Field label="USD → EUR" type="number" value={settings.exchange_rates?.EUR} onChange={v => setNested('exchange_rates','EUR',Number(v))} placeholder="0.92"/>
          </div>
        </div>
      )

      case 'maintenance': return (
        <div className="space-y-4">
          <h3 className="font-display font-semibold" style={{ color:'var(--txt)' }}>Mantenimiento</h3>
          {settings.maintenance_mode?.enabled && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', color:'#FCD34D' }}>
              <AlertTriangle size={16}/>
              <p className="text-sm">El modo mantenimiento está activo. Los usuarios no pueden acceder.</p>
            </motion.div>
          )}
          <div className="rounded-xl border px-4" style={{ borderColor:'var(--border2)' }}>
            <ToggleSwitch
              value={settings.maintenance_mode?.enabled ?? false}
              onChange={v => setNested('maintenance_mode','enabled',v)}
              label="Modo mantenimiento"
              desc="Bloquea el acceso de usuarios al panel"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--txt2)' }}>Mensaje de mantenimiento</label>
            <textarea value={settings.maintenance_mode?.message ?? ''} rows={3}
              onChange={e => setNested('maintenance_mode','message',e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt)' }}
              onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
              onBlur={e => e.target.style.borderColor='var(--border2)'}/>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>Configuración global</h1>
          <p className="text-sm" style={{ color:'var(--txt2)' }}>Administra la configuración del panel</p>
        </div>
        <button onClick={fetchSettings} className="p-2 rounded-xl transition-all"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <RefreshCw size={15}/>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          {SECTIONS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setSection(id)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: section===id ? 'rgba(139,92,246,0.1)' : 'transparent',
                color: section===id ? '#A78BFA' : 'var(--txt2)',
                border:`1px solid ${section===id ? 'rgba(139,92,246,0.2)' : 'transparent'}`,
              }}>
              <Icon size={15}/>{label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          <motion.div key={section} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }}
            className="rounded-2xl border p-5"
            style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
            {renderSection()}
            <div className="mt-6 pt-4 border-t" style={{ borderColor:'var(--border2)' }}>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-display disabled:opacity-50"
                style={{ background:'var(--em)', color:'#000' }}>
                {saving
                  ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/>Guardando...</>
                  : <><Save size={14}/> Guardar cambios</>
                }
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
