import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, RefreshCw, Server, X, Zap, SlidersHorizontal,
  ChevronDown, ChevronUp, Star, Globe, Tag, Check,
  AlertCircle, Loader2, Heart, MessageCircle, Users, Radio
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = (id) => `provider_filters_${id}`

const DEFAULT_FILTERS = {
  categories:   [],     // [] = todas las categorías del proveedor
  serviceTypes: [],     // [] = todos los tipos (likes, comments, followers, reach)
  qualityOnly:  false,
  usaOnly:      false,
}

const QUALITY_KEYWORDS = ['premium', 'hq', 'high quality', 'real', 'organic', 'genuine', 'natural', 'non drop', 'nondrop', 'lifetime']
const USA_KEYWORDS     = ['usa', 'us', 'united states', 'american', 'america']

// Mapeo de tipos de servicio con sus keywords de detección
const SERVICE_TYPE_FILTERS = [
  {
    id: 'followers',
    label: 'Seguidores',
    icon: Users,
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.3)',
    keywords: ['follower', 'seguidores', 'subscribers', 'suscriptores', 'fans'],
  },
  {
    id: 'likes',
    label: 'Likes',
    icon: Heart,
    color: '#F472B6',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.3)',
    keywords: ['like', 'likes', 'heart', 'reaction', 'me gusta'],
  },
  {
    id: 'comments',
    label: 'Comentarios',
    icon: MessageCircle,
    color: '#34D399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.3)',
    keywords: ['comment', 'comentario', 'review', 'reseña'],
  },
  {
    id: 'reach',
    label: 'Reach / Vistas',
    icon: Radio,
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.3)',
    keywords: ['reach', 'view', 'vista', 'impression', 'impresion', 'play', 'watch', 'stream', 'stories'],
  },
]

function matchesServiceType(name, typeId) {
  const n = name.toLowerCase()
  const t = SERVICE_TYPE_FILTERS.find(t => t.id === typeId)
  return t ? t.keywords.some(k => n.includes(k)) : false
}

function loadFilters(providerId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(providerId))
    return raw ? { ...DEFAULT_FILTERS, ...JSON.parse(raw) } : { ...DEFAULT_FILTERS }
  } catch (err) {
    console.error('Error loading filters from localStorage:', err)
    return { ...DEFAULT_FILTERS }
  }
}
function saveFilters(providerId, filters) {
  try {
    localStorage.setItem(STORAGE_KEY(providerId), JSON.stringify(filters))
  } catch (err) {
    console.error('Error saving filters to localStorage:', err)
  }
}

// ─── Provider edit modal ───────────────────────────────────────────────────────

function ProviderModal({ provider, onClose, onSaved }) {
  const isEdit = !!provider?.id
  const [form, setForm] = useState({
    name:    provider?.name    ?? '',
    api_url: provider?.api_url ?? '',
    api_key: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!form.name || !form.api_url || (!isEdit && !form.api_key)) {
      toast.error('Completa todos los campos')
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/admin/providers/${provider.id}`, form)
        toast.success('Proveedor actualizado')
      } else {
        await api.post('/admin/providers', form)
        toast.success('Proveedor creado')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar el proveedor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: .95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl border p-6 space-y-4"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>
            {isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <button onClick={onClose} style={{ color: 'var(--txt3)' }}><X size={18} /></button>
        </div>

        {[
          { key: 'name',    label: 'Nombre',  placeholder: 'Mi Proveedor SMM' },
          { key: 'api_url', label: 'API URL', placeholder: 'https://proveedor.com/api/v2' },
          { key: 'api_key', label: 'API Key', placeholder: isEdit ? '(dejar vacío para no cambiar)' : 'tu_api_key_aqui' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs mb-1.5 font-medium uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>
              {label}
            </label>
            <input
              value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              type={key === 'api_key' ? 'password' : 'text'}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: .98 }}
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 rounded-xl font-display font-bold text-sm disabled:opacity-50"
          style={{ background: 'var(--em)', color: '#000' }}
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proveedor'}
        </motion.button>
      </motion.div>
    </div>
  )
}

// ─── Filter panel ──────────────────────────────────────────────────────────────

function FilterPanel({ provider, onFiltersChange }) {
  const [open, setOpen]               = useState(false)
  const [filters, setFilters]         = useState(() => loadFilters(provider.id))
  const [catalogCats, setCatalogCats] = useState([])
  const [loadingCats, setLoadingCats] = useState(false)
  const [catError, setCatError]       = useState(false)
  const fetchedRef                    = useRef(false)

  useEffect(() => {
    saveFilters(provider.id, filters)
    onFiltersChange(filters)
  }, [filters]) // eslint-disable-line

  // FIX: ruta correcta es /admin/services/provider-categories
  useEffect(() => {
    if (!open || fetchedRef.current) return
    fetchedRef.current = true
    setLoadingCats(true)
    setCatError(false)
    api.get('/admin/services/provider-categories', { params: { provider_id: provider.id } })
      .then(({ data }) => {
        const cats = data?.data ?? data ?? []
        setCatalogCats(Array.isArray(cats) ? cats : [])
      })
      .catch(() => setCatError(true))
      .finally(() => setLoadingCats(false))
  }, [open, provider.id])

  const toggleCategory = (cat) => {
    setFilters(prev => {
      const already = prev.categories.includes(cat)
      return {
        ...prev,
        categories: already
          ? prev.categories.filter(c => c !== cat)
          : [...prev.categories, cat],
      }
    })
  }

  const toggleServiceType = (typeId) => {
    setFilters(prev => {
      const already = prev.serviceTypes.includes(typeId)
      return {
        ...prev,
        serviceTypes: already
          ? prev.serviceTypes.filter(t => t !== typeId)
          : [...prev.serviceTypes, typeId],
      }
    })
  }

  const activeCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.serviceTypes.length > 0 ? 1 : 0) +
    (filters.qualityOnly ? 1 : 0) +
    (filters.usaOnly ? 1 : 0)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all relative"
        style={{
          background: open || activeCount > 0 ? 'rgba(139,92,246,0.12)' : 'var(--bg3)',
          color: open || activeCount > 0 ? '#C4B5FD' : 'var(--txt2)',
          border: `1px solid ${open || activeCount > 0 ? 'rgba(139,92,246,0.3)' : 'var(--border2)'}`,
        }}
      >
        <SlidersHorizontal size={12} />
        Filtros de sync
        {activeCount > 0 && (
          <span
            className="ml-1 px-1.5 py-0.5 rounded-md font-bold"
            style={{ background: 'rgba(139,92,246,0.25)', color: '#C4B5FD', fontSize: '10px' }}
          >
            {activeCount}
          </span>
        )}
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="rounded-xl p-4 space-y-5"
              style={{ background: 'var(--bg)', border: '1px solid rgba(139,92,246,0.18)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#A78BFA' }}>
                  Filtros de sincronización
                </p>
                {activeCount > 0 && (
                  <button
                    onClick={() => setFilters({ ...DEFAULT_FILTERS })}
                    className="text-xs px-2 py-1 rounded-lg transition-all"
                    style={{ color: 'var(--txt3)', background: 'var(--bg3)' }}
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* ── Tipo de servicio ── */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <Zap size={12} style={{ color: '#FBBF24' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--txt2)' }}>
                    Tipo de servicio
                  </p>
                  {filters.serviceTypes.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>
                      {filters.serviceTypes.length} activos
                    </span>
                  )}
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--txt3)' }}>
                  {filters.serviceTypes.length === 0
                    ? 'Sin selección = importa todos los tipos'
                    : `Solo importa: ${filters.serviceTypes.map(t => SERVICE_TYPE_FILTERS.find(f => f.id === t)?.label).join(', ')}`}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_TYPE_FILTERS.map(({ id, label, icon: Icon, color, bg, border }) => {
                    const selected = filters.serviceTypes.includes(id)
                    return (
                      <button
                        key={id}
                        onClick={() => toggleServiceType(id)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all"
                        style={{
                          background: selected ? bg : 'var(--bg3)',
                          border: `1px solid ${selected ? border : 'var(--border2)'}`,
                          color: selected ? color : 'var(--txt3)',
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            background: selected ? color : 'var(--bg4)',
                            border: `1px solid ${selected ? color : 'var(--border2)'}`,
                          }}
                        >
                          {selected && <Check size={10} color="#000" />}
                        </span>
                        <Icon size={13} />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Calidad ── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={12} style={{ color: '#FCD34D' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--txt2)' }}>Calidad</p>
                </div>
                <button
                  onClick={() => setFilters(p => ({ ...p, qualityOnly: !p.qualityOnly }))}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-all text-left"
                  style={{
                    background: filters.qualityOnly ? 'rgba(252,211,77,0.08)' : 'var(--bg3)',
                    border: `1px solid ${filters.qualityOnly ? 'rgba(252,211,77,0.3)' : 'var(--border2)'}`,
                    color: filters.qualityOnly ? '#FCD34D' : 'var(--txt3)',
                  }}
                >
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: filters.qualityOnly ? '#FCD34D' : 'var(--bg4)',
                      border: `1px solid ${filters.qualityOnly ? '#FCD34D' : 'var(--border2)'}`,
                    }}
                  >
                    {filters.qualityOnly && <Check size={10} color="#000" />}
                  </span>
                  Solo Premium / HQ / Real / Non-Drop
                </button>
              </div>

              {/* ── País de origen ── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={12} style={{ color: '#60A5FA' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--txt2)' }}>País de origen</p>
                </div>
                <button
                  onClick={() => setFilters(p => ({ ...p, usaOnly: !p.usaOnly }))}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-all text-left"
                  style={{
                    background: filters.usaOnly ? 'rgba(96,165,250,0.08)' : 'var(--bg3)',
                    border: `1px solid ${filters.usaOnly ? 'rgba(96,165,250,0.3)' : 'var(--border2)'}`,
                    color: filters.usaOnly ? '#93C5FD' : 'var(--txt3)',
                  }}
                >
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: filters.usaOnly ? '#60A5FA' : 'var(--bg4)',
                      border: `1px solid ${filters.usaOnly ? '#60A5FA' : 'var(--border2)'}`,
                    }}
                  >
                    {filters.usaOnly && <Check size={10} color="#000" />}
                  </span>
                  Solo servicios de USA / United States
                </button>
              </div>

              {/* ── Categorías del proveedor ── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={12} style={{ color: '#A78BFA' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--txt2)' }}>
                    Categorías del proveedor
                  </p>
                  {filters.categories.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(139,92,246,0.15)', color: '#C4B5FD' }}>
                      {filters.categories.length} seleccionadas
                    </span>
                  )}
                </div>

                {loadingCats ? (
                  <div className="flex items-center gap-2 py-3" style={{ color: 'var(--txt3)' }}>
                    <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                    <span className="text-xs">Cargando categorías del proveedor...</span>
                  </div>
                ) : catError ? (
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <AlertCircle size={13} style={{ color: '#F87171', flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: '#F87171' }}>
                      No se pudo conectar con el proveedor. Verificá la API key.
                    </p>
                  </div>
                ) : catalogCats.length === 0 ? (
                  <p className="text-xs py-2" style={{ color: 'var(--txt3)' }}>
                    No se encontraron categorías. Guardá el proveedor y volvé a intentarlo.
                  </p>
                ) : (
                  <>
                    <p className="text-xs mb-2" style={{ color: 'var(--txt3)' }}>
                      {filters.categories.length === 0
                        ? 'Sin selección = importa todas las categorías'
                        : `Importando solo: ${filters.categories.length} de ${catalogCats.length}`}
                    </p>
                    <div
                      className="grid gap-1.5 overflow-y-auto pr-1"
                      style={{ maxHeight: 220, gridTemplateColumns: '1fr 1fr' }}
                    >
                      {catalogCats.map(cat => {
                        const selected = filters.categories.includes(cat)
                        return (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all"
                            style={{
                              background: selected ? 'rgba(139,92,246,0.1)' : 'var(--bg3)',
                              border: `1px solid ${selected ? 'rgba(139,92,246,0.35)' : 'var(--border2)'}`,
                              color: selected ? '#C4B5FD' : 'var(--txt3)',
                            }}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0"
                              style={{
                                background: selected ? '#A78BFA' : 'var(--bg4)',
                                border: `1px solid ${selected ? '#A78BFA' : 'var(--border2)'}`,
                              }}
                            >
                              {selected && <Check size={9} color="#000" />}
                            </span>
                            <span className="text-xs truncate">{cat}</span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setFilters(p => ({ ...p, categories: [...catalogCats] }))}
                        className="text-xs px-2 py-1 rounded-lg transition-all"
                        style={{ color: '#A78BFA', background: 'rgba(139,92,246,0.08)' }}
                      >
                        Seleccionar todas
                      </button>
                      <button
                        onClick={() => setFilters(p => ({ ...p, categories: [] }))}
                        className="text-xs px-2 py-1 rounded-lg transition-all"
                        style={{ color: 'var(--txt3)', background: 'var(--bg3)' }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* ── Resumen ── */}
              <div
                className="rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}
              >
                <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--txt2)' }}>
                  Al sincronizar se importarán servicios que cumplan:
                </p>
                <ul className="space-y-1">
                  <li className="text-xs flex items-center gap-1.5" style={{ color: filters.serviceTypes.length > 0 ? '#FBBF24' : 'var(--txt3)' }}>
                    <span>▸</span>
                    {filters.serviceTypes.length > 0
                      ? `Tipos: ${filters.serviceTypes.map(t => SERVICE_TYPE_FILTERS.find(f => f.id === t)?.label).join(', ')}`
                      : 'Todos los tipos de servicio'}
                  </li>
                  <li className="text-xs flex items-center gap-1.5" style={{ color: filters.categories.length > 0 ? '#C4B5FD' : 'var(--txt3)' }}>
                    <span>▸</span>
                    {filters.categories.length > 0
                      ? `Categorías: ${filters.categories.slice(0, 2).join(', ')}${filters.categories.length > 2 ? ` +${filters.categories.length - 2}` : ''}`
                      : 'Todas las categorías'}
                  </li>
                  <li className="text-xs flex items-center gap-1.5" style={{ color: filters.qualityOnly ? '#FCD34D' : 'var(--txt3)' }}>
                    <span>▸</span>
                    {filters.qualityOnly ? 'Solo Premium / HQ / Real' : 'Cualquier calidad'}
                  </li>
                  <li className="text-xs flex items-center gap-1.5" style={{ color: filters.usaOnly ? '#93C5FD' : 'var(--txt3)' }}>
                    <span>▸</span>
                    {filters.usaOnly ? 'Solo origen USA' : 'Cualquier país'}
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminProviders() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalData, setModalData] = useState(null)
  const [syncing, setSyncing]     = useState({})

  const filtersRef = useRef({})

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/providers')
      setProviders(data?.data ?? data?.providers ?? [])
    } catch (err) {
      console.error('Error fetching providers:', err)
      toast.error('Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProviders() }, [fetchProviders])

  const syncServices = async (providerId) => {
    const filters = filtersRef.current[providerId] ?? DEFAULT_FILTERS
    setSyncing(p => ({ ...p, [providerId]: true }))
    try {
      const { data } = await api.post(`/admin/providers/${providerId}/sync`, { filters })
      const count    = data?.data?.synced   ?? data?.synced   ?? '?'
      const filtered = data?.data?.filtered ?? data?.filtered
      const msg = filtered !== undefined
        ? `${count} servicios sincronizados (${filtered} descartados por filtros)`
        : `${count} servicios sincronizados`
      toast.success(msg)
      fetchProviders()
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al sincronizar servicios')
    } finally {
      setSyncing(p => ({ ...p, [providerId]: false }))
    }
  }

  const checkBalance = async (providerId) => {
    try {
      const { data } = await api.get(`/admin/providers/${providerId}/balance`)
      const bal = data?.data?.balance ?? data?.balance ?? '—'
      toast.success(`Balance del proveedor: $${bal}`)
      fetchProviders()
    } catch (err) {
      console.error('Error checking balance:', err)
      toast.error('Error al consultar balance del proveedor')
    }
  }

  const deleteProvider = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor? Sus servicios se desactivarán.')) return
    try {
      await api.delete(`/admin/providers/${id}`)
      toast.success('Proveedor eliminado')
      fetchProviders()
    } catch (err) {
      console.error('Error deleting provider:', err)
      toast.error('Error al eliminar proveedor')
    }
  }

  const STATUS_COLOR = {
    active:   { bg: 'rgba(16,185,129,0.1)',  color: 'var(--em3)',  label: 'Activo'   },
    inactive: { bg: 'rgba(100,116,139,0.1)', color: 'var(--txt3)', label: 'Inactivo' },
    error:    { bg: 'rgba(239,68,68,0.1)',   color: '#F87171',     label: 'Error'    },
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
            Proveedores SMM
          </h1>
          <p className="text-sm" style={{ color: 'var(--txt2)' }}>
            Gestiona las APIs de proveedores, configurá filtros y sincronizá servicios.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProviders} className="p-2 rounded-xl transition-all"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt2)' }}>
            <RefreshCw size={15} />
          </button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
            onClick={() => setModalData({})}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold"
            style={{ background: 'var(--em)', color: '#000' }}>
            <Plus size={16} /> Nuevo Proveedor
          </motion.button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--bg4)' }} />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--txt3)' }}>
          <Server size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm mb-2">No hay proveedores configurados</p>
          <button onClick={() => setModalData({})} className="text-sm" style={{ color: 'var(--em3)' }}>
            Agregar el primero →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {providers.map((p, i) => {
              const sc = STATUS_COLOR[p.status] ?? STATUS_COLOR.inactive
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: .2, delay: i * .05 }}
                  className="rounded-2xl border p-5"
                  style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <Server size={18} style={{ color: 'var(--em3)' }} />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm" style={{ color: 'var(--txt)' }}>{p.name}</p>
                        <p className="text-xs truncate max-w-44" style={{ color: 'var(--txt3)' }}>{p.api_url}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg3)', border: '1px solid var(--border2)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--txt3)' }}>Balance</p>
                      <p className="font-display font-bold text-base" style={{ color: 'var(--em3)' }}>
                        ${Number(p.balance ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--bg3)', border: '1px solid var(--border2)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--txt3)' }}>Última sync</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--txt2)' }}>
                        {p.last_sync
                          ? new Date(p.last_sync).toLocaleString('es', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                          : 'Nunca'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <FilterPanel
                      provider={p}
                      onFiltersChange={(f) => { filtersRef.current[p.id] = f }}
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => syncServices(p.id)}
                      disabled={syncing[p.id]}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                      style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--em3)', border: '1px solid rgba(16,185,129,0.15)' }}
                    >
                      <motion.div
                        animate={{ rotate: syncing[p.id] ? 360 : 0 }}
                        transition={{ duration: 1, repeat: syncing[p.id] ? Infinity : 0, ease: 'linear' }}>
                        <RefreshCw size={12} />
                      </motion.div>
                      {syncing[p.id] ? 'Sincronizando...' : 'Sync servicios'}
                    </button>

                    <button
                      onClick={() => checkBalance(p.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'rgba(96,165,250,0.08)', color: '#93C5FD', border: '1px solid rgba(96,165,250,0.15)' }}>
                      <Zap size={12} /> Ver balance
                    </button>

                    <button
                      onClick={() => setModalData(p)}
                      className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
                      Editar
                    </button>

                    <button
                      onClick={() => deleteProvider(p.id)}
                      className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'rgba(239,68,68,0.06)', color: '#F87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {modalData !== null && (
        <ProviderModal
          provider={modalData?.id ? modalData : null}
          onClose={() => setModalData(null)}
          onSaved={fetchProviders}
        />
      )}
    </div>
  )
}
