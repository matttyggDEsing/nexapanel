// src/pages/admin/AdminServices.jsx — REEMPLAZO COMPLETO
// FIX: agrega panel de Markup de precios

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, RefreshCw, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, TrendingUp, Percent } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmModal'

// ─── Panel de Markup ──────────────────────────────────────────
function MarkupPanel({ onApplied }) {
  const [markupPercent, setMarkupPercent] = useState('')
  const [applying, setApplying] = useState(false)
  const { confirm, modal } = useConfirm()

  const PRESETS = [
    { label: '2×', value: 100, desc: 'Doble del costo' },
    { label: '3×', value: 200, desc: 'Triple del costo' },
    { label: '50%', value: 50, desc: '+50% sobre costo' },
    { label: '150%', value: 150, desc: '+150% sobre costo' },
  ]

  const applyMarkup = async () => {
    const pct = parseFloat(markupPercent)
    if (isNaN(pct) || pct < 0) {
      toast.error('Ingresa un porcentaje válido (ej: 100 = precio doble')
      return
    }
    const confirmed = await confirm(
      'Aplicar markup',
      `¿Aplicar markup de ${pct}% a TODOS los servicios?\n\nEsto cambiará el precio de venta. Ej: si el costo del proveedor es $0.50, el precio al usuario quedará en $${(0.50 * (1 + pct / 100)).toFixed(2)}.`,
      { confirmText: 'Aplicar', variant: 'danger' }
    )
    if (!confirmed) return

    setApplying(true)
    try {
      const { data } = await api.post('/admin/services/apply-markup', {
        markup_percent: pct,
      })
      toast.success(data?.message ?? `Markup aplicado a ${data?.data?.updated ?? '?'} servicios`)
      onApplied?.()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error aplicando markup')
    } finally {
      setApplying(false)
    }
  }

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
      className="rounded-2xl border p-5"
      style={{ background:'var(--bg2)', borderColor:'rgba(139,92,246,0.2)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)' }}>
          <Percent size={16} style={{ color:'#A78BFA' }}/>
        </div>
        <div>
          <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>
            Markup de precios
          </h2>
          <p className="text-xs" style={{ color:'var(--txt3)' }}>
            El precio de venta = costo del proveedor × (1 + markup%)
          </p>
        </div>
      </div>

      {/* Ejemplo visual */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        {[
          { label: 'Costo proveedor', val: '$0.50', color: '#F87171' },
          { label: `+ ${markupPercent || 0}% markup`, val: `+$${(0.50 * (parseFloat(markupPercent||0)/100)).toFixed(2)}`, color: '#FCD34D' },
          { label: 'Precio usuario', val: `$${(0.50 * (1 + parseFloat(markupPercent||0)/100)).toFixed(2)}`, color: '#34D399' },
        ].map(({ label, val, color }) => (
          <div key={label} className="rounded-xl p-3" style={{ background:'var(--bg3)', border:'1px solid var(--border2)' }}>
            <p className="font-display font-bold text-lg" style={{ color }}>{val}</p>
            <p className="text-xs mt-1" style={{ color:'var(--txt3)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Presets */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {PRESETS.map(p => (
          <button key={p.value} onClick={() => setMarkupPercent(String(p.value))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: markupPercent === String(p.value) ? 'rgba(139,92,246,0.15)' : 'var(--bg3)',
              border:`1px solid ${markupPercent === String(p.value) ? 'rgba(139,92,246,0.4)' : 'var(--border2)'}`,
              color: markupPercent === String(p.value) ? '#C4B5FD' : 'var(--txt3)',
            }}>
            {p.label} <span className="opacity-60">({p.desc})</span>
          </button>
        ))}
      </div>

      {/* Input personalizado */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number" min="0" max="10000"
            value={markupPercent}
            onChange={e => setMarkupPercent(e.target.value)}
            placeholder="Ej: 200 (= precio triple del costo)"
            className="w-full pl-4 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt)' }}
            onFocus={e => e.target.style.borderColor='rgba(139,92,246,0.4)'}
            onBlur={e => e.target.style.borderColor='var(--border2)'}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold"
            style={{ color:'var(--txt3)' }}>%</span>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
          onClick={applyMarkup} disabled={applying || !markupPercent}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold disabled:opacity-50"
          style={{ background:'#A78BFA', color:'#000' }}>
          {applying
            ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/>
            : <><TrendingUp size={14}/> Aplicar</>
          }
        </motion.button>
      </div>

      <p className="text-xs mt-3" style={{ color:'rgba(245,158,11,0.8)' }}>
        ⚠️ Esto modifica el precio de todos los servicios. El costo del proveedor (<code>provider_rate</code>) no cambia.
      </p>
      {modal}
    </motion.div>
  )
}

export default function AdminServices() {
  const [services, setServices]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [pagination, setPagination] = useState({ page:1, totalPages:1, total:0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [svcRes, catRes] = await Promise.all([
        api.get('/admin/services', {
          params: { page: pagination.page, perPage: 20, search: search || undefined, category: catFilter || undefined }
        }),
        api.get('/services/categories'),
      ])
      setServices(svcRes.data?.data ?? svcRes.data?.services ?? [])
      if (svcRes.data?.pagination) setPagination(svcRes.data.pagination)
      setCategories(catRes.data?.data ?? catRes.data?.categories ?? [])
    } catch (err) {
      console.error('Error fetching services:', err)
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, search, catFilter])

  useEffect(() => { fetchData() }, [pagination.page, search, catFilter]) // eslint-disable-line

  const toggleActive = async (service) => {
    try {
      await api.patch(`/admin/services/${service.id}`, { is_active: service.is_active ? 0 : 1 })
      toast.success(service.is_active ? 'Servicio desactivado' : 'Servicio activado')
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al cambiar estado del servicio')
    }
  }

  const toggleSellerVisible = async (service) => {
    try {
      await api.patch(`/admin/services/${service.id}`, { seller_visible: service.seller_visible ? 0 : 1 })
      toast.success(service.seller_visible ? 'Oculto para vendedores' : 'Visible para vendedores')
      fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al cambiar visibilidad')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
          Servicios
        </h1>
        <p className="text-sm" style={{ color:'var(--txt2)' }}>
          {loading ? '—' : `${pagination.total} servicios en total`}
        </p>
      </motion.div>

      {/* Markup panel */}
      <MarkupPanel onApplied={fetchData} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--txt3)' }}/>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') { setSearch(searchInput); setPagination(p=>({...p,page:1})) } }}
            placeholder="Nombre o ID (Enter)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt)', caretColor:'var(--em)' }}
            onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor='var(--border2)'}
          />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPagination(p=>({...p,page:1})) }}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug ?? c.id}>{c.name}</option>
          ))}
        </select>
        <button onClick={fetchData} className="p-2.5 rounded-xl transition-all"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <RefreshCw size={14}/>
        </button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border2)', background:'var(--bg3)' }}>
                {['ID','Nombre','Categoría','Proveedor','Costo/1K','Precio/1K','Ganancia','Min','Max','Tipo','Activo','Vendedor'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color:'var(--txt3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border2)' }}>
                    {[...Array(10)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background:'var(--bg4)', width:j===1?'140px':'60px' }}/>
                      </td>
                    ))}
                  </tr>
                ))
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-16" style={{ color:'var(--txt3)' }}>
                    <p className="text-sm">No se encontraron servicios</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {services.map((s, i) => {
                    const cost  = Number(s.provider_rate > 0 ? s.provider_rate : null)
                    const price = Number(s.rate)
                    const profit = price > 0 && cost > 0 ? (((price - cost) / cost) * 100) : null

                    return (
                      <motion.tr key={s.id}
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        transition={{ delay:i*.02 }}
                        style={{ borderBottom:'1px solid var(--border2)' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color:'var(--txt3)' }}>#{s.id}</td>
                        <td className="px-4 py-3 max-w-52">
                          <p className="text-sm truncate" style={{ color:'var(--txt)' }}>{s.name}</p>
                          {s.type && <p className="text-xs mt-0.5" style={{ color:'var(--txt3)' }}>{s.type}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--txt2)' }}>
                          {s.category_name ?? s.category_slug ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--txt2)' }}>
                          {s.provider_name ?? '—'}
                        </td>
                        {/* Costo del proveedor */}
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: cost ? '#F87171' : 'var(--txt3)' }}>
  			{cost ? `$${cost.toFixed(4)}` : '—'}
			</td>
                        {/* Precio de venta al usuario */}
                        <td className="px-4 py-3 font-display font-bold text-sm" style={{ color:'var(--em3)' }}>
                          ${price.toFixed(4)}
                        </td>
                        {/* Margen */}
                        <td className="px-4 py-3 text-xs font-semibold" style={{ color: profit > 0 ? '#A78BFA' : 'var(--txt3)' }}>
                          {profit !== null ? `+${profit}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--txt2)' }}>
                          {Number(s.min_order).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color:'var(--txt2)' }}>
                          {Number(s.max_order).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="px-2 py-0.5 rounded-lg font-medium"
                            style={{
                              background: s.pricing_type === 'per_unit' ? 'rgba(251,191,36,0.12)' : 'rgba(96,165,250,0.12)',
                              color: s.pricing_type === 'per_unit' ? '#FBBF24' : '#60A5FA',
                            }}>
                            {s.pricing_type === 'per_unit' ? 'Unidad' : 'x1000'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleActive(s)}
                            className="transition-all"
                            style={{ color: s.is_active ? 'var(--em3)' : 'var(--txt3)' }}>
                            {s.is_active
                              ? <ToggleRight size={22}/>
                              : <ToggleLeft  size={22}/>}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleSellerVisible(s)}
                            className="transition-all"
                            style={{ color: s.seller_visible ? 'var(--em3)' : 'var(--txt3)' }}>
                            {s.seller_visible
                              ? <ToggleRight size={22}/>
                              : <ToggleLeft  size={22}/>}
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor:'var(--border2)' }}>
            <p className="text-xs" style={{ color:'var(--txt3)' }}>Página {pagination.page} de {pagination.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPagination(p=>({...p,page:p.page-1}))} disabled={pagination.page===1}
                className="p-1.5 rounded-lg disabled:opacity-30" style={{ background:'var(--bg3)', color:'var(--txt2)' }}>
                <ChevronLeft size={14}/>
              </button>
              <button onClick={() => setPagination(p=>({...p,page:p.page+1}))} disabled={pagination.page===pagination.totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30" style={{ background:'var(--bg3)', color:'var(--txt2)' }}>
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
