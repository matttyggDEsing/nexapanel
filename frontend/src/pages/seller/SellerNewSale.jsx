// src/pages/seller/SellerNewSale.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  User, ShoppingCart, CreditCard, FileImage, CheckCircle,
  Search, Plus, Minus, X, ChevronLeft, ChevronRight,
  Loader2, Upload, AlertCircle, ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { sellerService } from '@/services/sellerService'
import { useDebounce } from '@/hooks/useDebounce'

const STEPS = [
  { id: 1, label: 'Cliente',         icon: User },
  { id: 2, label: 'Servicios',       icon: ShoppingCart },
  { id: 3, label: 'Pago',            icon: CreditCard },
  { id: 4, label: 'Comprobante',     icon: FileImage },
  { id: 5, label: 'Confirmar',       icon: CheckCircle },
]

const PAYMENT_METHODS = [
  { id: 'transferencia', label: 'Transferencia',  emoji: '🏦' },
  { id: 'mercadopago',   label: 'Mercado Pago',   emoji: '💙' },
  { id: 'crypto',        label: 'Crypto',          emoji: '₿' },
  { id: 'efectivo',      label: 'Efectivo',        emoji: '💵' },
  { id: 'otro',          label: 'Otro',            emoji: '💳' },
]

const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ step }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done    = step > s.id
        const active  = step === s.id
        const Icon    = s.icon
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  background: done ? '#10B981' : active ? 'rgba(16,185,129,0.15)' : 'var(--bg3)',
                  borderColor: done || active ? '#10B981' : 'var(--border2)',
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all"
              >
                {done
                  ? <CheckCircle size={16} color="#fff" />
                  : <Icon size={15} color={active ? '#10B981' : 'var(--txt3)'} />
                }
              </motion.div>
              <span className="text-xs mt-1 font-medium hidden sm:block"
                style={{ color: done || active ? 'var(--em3)' : 'var(--txt3)' }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-2 transition-all"
                style={{ background: step > s.id ? 'rgba(16,185,129,0.5)' : 'var(--border2)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Paso 1: Selector de cliente ───────────────────────────────────────────────
function StepCustomer({ selected, onSelect }) {
  const [mode, setMode] = useState(selected ? 'selected' : 'search') // 'search' | 'create' | 'selected'
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounced = useDebounce(query, 350)

  // Form nuevo cliente
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', whatsapp: '', instagram: '', facebook: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (mode !== 'search') return
    setLoading(true)
    sellerService.getCustomers({ page: 1, perPage: 8, search: debounced || undefined })
      .then(res => setResults(res.data?.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debounced, mode])

  const handleCreate = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error('Nombre y apellido son requeridos')
      return
    }
    setSaving(true)
    try {
      const res = await sellerService.createCustomer(form)
      const newId = res.data?.data?.id
      if (newId) {
        const detail = await sellerService.getCustomer(newId)
        onSelect(detail.data?.data || { ...form, id: newId })
        setMode('selected')
        toast.success('Cliente creado')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al crear cliente')
    } finally { setSaving(false) }
  }

  if (mode === 'selected' && selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.25)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.12)' }}>
            <User size={18} color="#10B981" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm" style={{ color: 'var(--txt)' }}>
              {selected.first_name} {selected.last_name}
            </p>
            {selected.email && <p className="text-xs truncate" style={{ color: 'var(--txt3)' }}>{selected.email}</p>}
            {selected.whatsapp && <p className="text-xs" style={{ color: 'var(--txt3)' }}>📱 {selected.whatsapp}</p>}
          </div>
          <button onClick={() => { onSelect(null); setMode('search') }}
            className="p-1.5 rounded-lg transition-all"
            style={{ background: 'var(--bg3)', color: 'var(--txt3)', border: '1px solid var(--border2)' }}>
            <X size={13} />
          </button>
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--txt3)' }}>
          Cliente seleccionado. Hacé clic en la ✕ para cambiarlo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'search', label: 'Buscar cliente' },
          { id: 'create', label: 'Crear nuevo' },
        ].map(t => (
          <button key={t.id} onClick={() => setMode(t.id)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: mode === t.id ? 'rgba(16,185,129,0.1)' : 'var(--bg3)',
              border: `1px solid ${mode === t.id ? 'rgba(16,185,129,0.3)' : 'var(--border2)'}`,
              color: mode === t.id ? 'var(--em3)' : 'var(--txt2)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {mode === 'search' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Nombre, apellido, email o WhatsApp..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
              autoFocus
            />
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border2)' }}>
            {loading ? (
              <div className="py-8 flex items-center justify-center gap-2" style={{ color: 'var(--txt3)' }}>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Buscando...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center" style={{ color: 'var(--txt3)' }}>
                <User size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {query ? 'Sin resultados' : 'Escribí para buscar un cliente'}
                </p>
              </div>
            ) : (
              results.map((c, i) => (
                <button key={c.id}
                  onClick={() => { onSelect(c); setMode('selected') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                  style={{
                    borderBottom: i < results.length - 1 ? '1px solid var(--border2)' : 'none',
                    color: 'var(--txt)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--bg4)' }}>
                    <User size={14} color="var(--txt3)" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.first_name} {c.last_name}</p>
                    {c.email && <p className="text-xs truncate" style={{ color: 'var(--txt3)' }}>{c.email}</p>}
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'var(--bg4)', color: 'var(--txt3)' }}>
                      {c.total_orders ?? 0} compras
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'first_name', label: 'Nombre *',   placeholder: 'Juan' },
              { key: 'last_name',  label: 'Apellido *', placeholder: 'García' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                />
              </div>
            ))}
          </div>
          {[
            { key: 'email',     label: 'Email',     placeholder: 'juan@email.com',     type: 'email' },
            { key: 'whatsapp',  label: 'WhatsApp',  placeholder: '+54 9 11 0000 0000', type: 'text' },
            { key: 'instagram', label: 'Instagram', placeholder: '@usuario',            type: 'text' },
            { key: 'facebook',  label: 'Facebook',  placeholder: 'facebook.com/...',   type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder} type={f.type}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>Observaciones</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={2} placeholder="Notas internas..."
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
          <button onClick={handleCreate} disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-semibold font-display flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: 'var(--em)', color: '#000' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {saving ? 'Creando...' : 'Crear y seleccionar'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Paso 2: Carrito de servicios ──────────────────────────────────────────────
function StepServices({ cart, onCartChange }) {
  const [query, setQuery]       = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(false)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const debounced = useDebounce(query, 350)

  useEffect(() => {
    sellerService.getCategories()
      .then(r => setCategories(r.data?.data || []))
      .catch(() => {})
  }, [])

  const loadServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sellerService.getServices({
        page,
        perPage: 12,
        search: debounced || undefined,
        category_id: categoryId || undefined,
      })
      setServices(res.data?.data || [])
      setTotalPages(res.data?.pagination?.totalPages || 1)
    } catch (_) {} finally { setLoading(false) }
  }, [debounced, categoryId, page])

  useEffect(() => { setPage(1) }, [debounced, categoryId])
  useEffect(() => { loadServices() }, [loadServices])

  const addToCart = (svc) => {
    onCartChange(prev => {
      const existing = prev.find(i => i.service_id === svc.id)
      if (existing) {
        return prev.map(i => i.service_id === svc.id
          ? { ...i, quantity: i.quantity + 1, subtotal: ((i.quantity + 1) / 1000) * i.unit_price }
          : i
        )
      }
      return [...prev, {
        service_id: svc.id,
        service_name: svc.name,
        unit_price: parseFloat(svc.rate || 0),
        quantity: 1,
        subtotal: (1 / 1000) * parseFloat(svc.rate || 0),
      }]
    })
  }

  const updateQty = (service_id, qty) => {
    if (qty < 1) {
      onCartChange(prev => prev.filter(i => i.service_id !== service_id))
      return
    }
    onCartChange(prev => prev.map(i =>
      i.service_id === service_id
        ? { ...i, quantity: qty, subtotal: (qty / 1000) * i.unit_price }
        : i
    ))
  }

  const updatePrice = (service_id, price) => {
    const p = parseFloat(price) || 0
    onCartChange(prev => prev.map(i =>
      i.service_id === service_id
        ? { ...i, unit_price: p, subtotal: (i.quantity / 1000) * p }
        : i
    ))
  }

  const total = cart.reduce((acc, i) => acc + i.subtotal, 0)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar servicios..."
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
            onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}>
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.emoji ? `${c.emoji} ` : ''}{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Servicios */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>Catálogo</p>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border2)', minHeight: 280 }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={18} className="animate-spin" style={{ color: 'var(--txt3)' }} />
              </div>
            ) : services.length === 0 ? (
              <div className="py-10 text-center" style={{ color: 'var(--txt3)' }}>
                <p className="text-sm">Sin servicios</p>
              </div>
            ) : (
              services.map((svc, i) => {
                const inCart = cart.find(c => c.service_id === svc.id)
                return (
                  <div key={svc.id}
                    className="flex items-center justify-between px-3 py-2.5 gap-2"
                    style={{ borderBottom: i < services.length - 1 ? '1px solid var(--border2)' : 'none' }}>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate font-medium" style={{ color: 'var(--txt)' }}>{svc.name}</p>
                      <p className="text-xs" style={{ color: 'var(--em3)' }}>{fmtMoney(svc.rate)} / 1000</p>
                    </div>
                    <button
                      onClick={() => addToCart(svc)}
                      className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: inCart ? 'rgba(16,185,129,0.15)' : 'var(--bg4)',
                        border: `1px solid ${inCart ? 'rgba(16,185,129,0.3)' : 'var(--border2)'}`,
                        color: inCart ? 'var(--em3)' : 'var(--txt3)',
                      }}>
                      <Plus size={12} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: 'var(--txt3)' }}>
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs" style={{ color: 'var(--txt3)' }}>{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: 'var(--txt3)' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Carrito */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>
            Carrito ({cart.length})
          </p>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border2)', minHeight: 280 }}>
            {cart.length === 0 ? (
              <div className="py-10 text-center" style={{ color: 'var(--txt3)' }}>
                <ShoppingCart size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Carrito vacío</p>
                <p className="text-xs mt-1">Agregá servicios desde el catálogo</p>
              </div>
            ) : (
              cart.map((item, i) => (
                <div key={item.service_id}
                  className="px-3 py-2.5 space-y-1.5"
                  style={{ borderBottom: i < cart.length - 1 ? '1px solid var(--border2)' : 'none' }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium truncate flex-1" style={{ color: 'var(--txt)' }}>{item.service_name}</p>
                    <button onClick={() => updateQty(item.service_id, 0)}
                      className="flex-shrink-0" style={{ color: 'var(--txt3)' }}>
                      <X size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Cantidad */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.service_id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--bg4)', color: 'var(--txt3)' }}>
                        <Minus size={10} />
                      </button>
                      <input
                        type="number" min="1"
                        value={item.quantity}
                        onChange={e => updateQty(item.service_id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center text-xs py-1 rounded-lg outline-none"
                        style={{ background: 'var(--bg4)', color: 'var(--txt)', border: '1px solid var(--border2)' }}
                      />
                      <button onClick={() => updateQty(item.service_id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--bg4)', color: 'var(--txt3)' }}>
                        <Plus size={10} />
                      </button>
                    </div>
                    {/* Precio unitario */}
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--txt3)' }}>$</span>
                      <input
                        type="number" step="0.01" min="0"
                        value={item.unit_price}
                        onChange={e => updatePrice(item.service_id, e.target.value)}
                        className="w-full pl-5 pr-2 py-1 rounded-lg text-xs outline-none"
                        style={{ background: 'var(--bg4)', color: 'var(--txt)', border: '1px solid var(--border2)' }}
                      />
                    </div>
                    {/* Subtotal */}
                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--em3)' }}>
                      {fmtMoney(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="flex items-center justify-between px-2">
              <span className="text-sm" style={{ color: 'var(--txt2)' }}>Total</span>
              <span className="font-display font-bold text-lg" style={{ color: 'var(--em3)' }}>{fmtMoney(total)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Paso 3: Método de pago ────────────────────────────────────────────────────
function StepPayment({ method, notes, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--txt)' }}>Seleccioná el método de pago</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PAYMENT_METHODS.map(m => (
            <motion.button key={m.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange({ method: m.id })}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all"
              style={{
                background: method === m.id ? 'rgba(16,185,129,0.08)' : 'var(--bg3)',
                borderColor: method === m.id ? 'rgba(16,185,129,0.4)' : 'var(--border2)',
              }}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-medium" style={{ color: method === m.id ? 'var(--em3)' : 'var(--txt2)' }}>
                {m.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>
          Observaciones (opcional)
        </label>
        <textarea value={notes} onChange={e => onChange({ notes: e.target.value })}
          rows={3} placeholder="Notas internas sobre esta venta..."
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
          style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
          onBlur={e => e.target.style.borderColor = 'var(--border2)'}
        />
      </div>
    </div>
  )
}

// ── Paso 4: Comprobante ───────────────────────────────────────────────────────
function StepVoucher({ file, onChange }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)

  const handleFile = (f) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(f.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG o WebP')
      return
    }
    onChange(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--txt2)' }}>
        Adjuntá el comprobante de pago del cliente (opcional). Podés hacerlo ahora o más tarde desde la venta.
      </p>

      {file ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.25)' }}>
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <img src={URL.createObjectURL(file)} alt="voucher" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--txt)' }}>{file.name}</p>
            <p className="text-xs" style={{ color: 'var(--txt3)' }}>{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => onChange(null)} style={{ color: 'var(--txt3)' }}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <motion.div
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          animate={{ borderColor: drag ? 'rgba(16,185,129,0.5)' : 'var(--border2)' }}
          className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
          style={{ background: drag ? 'rgba(16,185,129,0.04)' : 'var(--bg3)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            <Upload size={22} color="#10B981" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--txt)' }}>Arrastrá o hacé clic para subir</p>
            <p className="text-xs mt-1" style={{ color: 'var(--txt3)' }}>JPG, JPEG, PNG o WebP</p>
          </div>
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) handleFile(f) }} />
        </motion.div>
      )}
    </div>
  )
}

// ── Paso 5: Resumen ───────────────────────────────────────────────────────────
function StepSummary({ customer, cart, method, notes, file }) {
  const total = cart.reduce((acc, i) => acc + i.subtotal, 0)
  const methodLabel = PAYMENT_METHODS.find(m => m.id === method)?.label || method

  return (
    <div className="space-y-4">
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border2)' }}>
        {/* Cliente */}
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border2)', background: 'var(--bg3)' }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>Cliente</p>
          <p className="text-sm font-medium" style={{ color: 'var(--txt)' }}>{customer?.first_name} {customer?.last_name}</p>
          {customer?.email && <p className="text-xs" style={{ color: 'var(--txt3)' }}>{customer.email}</p>}
        </div>

        {/* Items */}
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border2)' }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--txt3)' }}>
            Servicios ({cart.length})
          </p>
          <div className="space-y-1.5">
            {cart.map(item => (
              <div key={item.service_id} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1 mr-2" style={{ color: 'var(--txt)' }}>{item.service_name}</span>
                <span style={{ color: 'var(--txt3)' }}>{item.quantity} × {fmtMoney(item.unit_price)}</span>
                <span className="ml-2 font-semibold" style={{ color: 'var(--em3)' }}>{fmtMoney(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pago */}
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border2)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>Método de pago</p>
            <span className="text-sm" style={{ color: 'var(--txt)' }}>{methodLabel}</span>
          </div>
        </div>

        {notes && (
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border2)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--txt3)' }}>Observaciones</p>
            <p className="text-xs" style={{ color: 'var(--txt2)' }}>{notes}</p>
          </div>
        )}

        {file && (
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border2)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--txt3)' }}>Comprobante</p>
            <p className="text-xs" style={{ color: 'var(--em3)' }}>✓ {file.name}</p>
          </div>
        )}

        {/* Total */}
        <div className="px-4 py-4 flex items-center justify-between"
          style={{ background: 'rgba(16,185,129,0.04)' }}>
          <span className="font-display font-semibold text-sm" style={{ color: 'var(--txt2)' }}>Total de la venta</span>
          <span className="font-display font-bold text-2xl" style={{ color: 'var(--em3)' }}>{fmtMoney(total)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SellerNewSale() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Sale state
  const [customer, setCustomer] = useState(null)
  const [cart, setCart]         = useState([])
  const [method, setMethod]     = useState('transferencia')
  const [notes, setNotes]       = useState('')
  const [file, setFile]         = useState(null)

  const [submitting, setSubmitting] = useState(false)

  const canNext = () => {
    if (step === 1) return !!customer
    if (step === 2) return cart.length > 0
    if (step === 3) return !!method
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        customer_id: customer.id,
        items: cart.map(i => ({
          service_id: i.service_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        payment_method: method,
        notes: notes || undefined,
      }

      const res = await sellerService.createSale(payload)
      const saleId = res.data?.data?.id

      // Subir comprobante si hay
      if (file && saleId) {
        const fd = new FormData()
        fd.append('voucher', file)
        await sellerService.uploadVoucher(saleId, fd).catch(() => {})
      }

      toast.success('¡Venta creada exitosamente!')
      navigate('/vendedor/ventas')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al crear la venta')
    } finally { setSubmitting(false) }
  }

  const stepContent = {
    1: <StepCustomer selected={customer} onSelect={setCustomer} />,
    2: <StepServices cart={cart} onCartChange={setCart} />,
    3: <StepPayment method={method} notes={notes} onChange={({ method: m, notes: n }) => {
      if (m !== undefined) setMethod(m)
      if (n !== undefined) setNotes(n)
    }} />,
    4: <StepVoucher file={file} onChange={setFile} />,
    5: <StepSummary customer={customer} cart={cart} method={method} notes={notes} file={file} />,
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3">
        <button onClick={() => navigate('/vendedor/ventas')}
          className="p-2 rounded-xl transition-all"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt3)' }}>
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
            Nueva Venta
          </h1>
          <p className="text-sm" style={{ color: 'var(--txt2)' }}>Paso {step} de {STEPS.length}</p>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border p-6"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
        <Stepper step={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}>
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navegación */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: 'var(--border2)' }}>
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30 transition-all"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt2)' }}>
            <ChevronLeft size={15} />
            Atrás
          </button>

          {step < STEPS.length ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-display disabled:opacity-40 transition-all"
              style={{ background: canNext() ? 'var(--em)' : 'var(--bg3)', color: canNext() ? '#000' : 'var(--txt3)' }}>
              Siguiente
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold font-display disabled:opacity-50 transition-all"
              style={{ background: 'var(--em)', color: '#000' }}>
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              {submitting ? 'Creando...' : 'Finalizar venta'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Resumen flotante del carrito */}
      <AnimatePresence>
        {step === 2 && cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl border px-5 py-3 flex items-center justify-between"
            style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} color="#10B981" />
              <span className="text-sm" style={{ color: 'var(--txt2)' }}>
                {cart.length} {cart.length === 1 ? 'servicio' : 'servicios'} en el carrito
              </span>
            </div>
            <span className="font-display font-bold" style={{ color: 'var(--em3)' }}>
              {fmtMoney(cart.reduce((a, i) => a + i.subtotal, 0))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
