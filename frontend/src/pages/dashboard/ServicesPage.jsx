import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, RefreshCw, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'

const CATEGORY_EMOJI = {
  instagram: '📸', tiktok: '🎵', youtube: '▶️',
  facebook: '👥', telegram: '✈️', twitter: '𝕏', spotify: '🎧',
}

export default function ServicesPage() {
  const [services, setServices]     = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory]     = useState('all')
  const [search, setSearch]         = useState('')
  const [sort, setSort]             = useState('default')
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [svcRes, catRes] = await Promise.all([
        api.get('/services', { params: { perPage: 500 } }),
        api.get('/services/categories'),
      ])
      setServices(svcRes.data?.data ?? svcRes.data?.services ?? [])
      setCategories(catRes.data?.data ?? catRes.data?.categories ?? [])
    } catch {
      // handled globally
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  let filtered = services.filter(s => {
    const slug = s.category_slug ?? s.category ?? ''
    const matchCat    = category === 'all' || slug === category
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || String(s.id).includes(search)
    return matchCat && matchSearch && s.is_active !== 0
  })

  if (sort === 'price-asc')  filtered = [...filtered].sort((a, b) => Number(a.rate) - Number(b.rate))
  if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => Number(b.rate) - Number(a.rate))

  const allCategories = [
    { id: 'all', name: 'Todos', slug: 'all', emoji: '✨' },
    ...categories.map(c => ({
      id: c.slug ?? c.id,
      name: c.name,
      slug: c.slug ?? c.id,
      emoji: CATEGORY_EMOJI[c.slug] ?? '🌐',
    })),
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
            Catálogo de Servicios
          </h1>
          <p className="text-sm" style={{ color:'var(--txt2)' }}>
            {loading ? 'Cargando servicios...' : `${filtered.length} servicios disponibles`}
          </p>
        </div>
        <button onClick={fetchData}
          className="p-2 rounded-xl transition-all"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <RefreshCw size={15} />
        </button>
      </motion.div>

      {/* Category tabs */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }}
        className="flex gap-2 overflow-x-auto pb-1">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-xl flex-shrink-0 animate-pulse" style={{ background:'var(--bg4)' }} />
          ))
        ) : (
          allCategories.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap text-sm font-medium flex-shrink-0 transition-all"
              style={{
                background: category===cat.id ? 'rgba(16,185,129,0.1)' : 'var(--bg2)',
                border:`1px solid ${category===cat.id ? 'rgba(16,185,129,0.25)' : 'var(--border2)'}`,
                color: category===cat.id ? 'var(--em3)' : 'var(--txt2)',
              }}>
              {cat.emoji} {cat.name}
            </button>
          ))
        )}
      </motion.div>

      {/* Search + sort */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.1 }}
        className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--txt3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar servicio o ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt)', caretColor:'var(--em)' }}
            onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor='var(--border2)'}
          />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <option value="default">Orden por defecto</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background:'var(--bg4)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color:'var(--txt3)' }}>
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-sm">No se encontraron servicios{search ? ` para "${search}"` : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((s, i) => (
              <motion.div key={s.id} layout
                initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0, scale:.95 }} transition={{ duration:.2, delay:i*.02 }}
                className="rounded-2xl border p-5 relative overflow-hidden hover-glow transition-all"
                style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono px-2 py-1 rounded-md"
                    style={{ background:'var(--bg4)', color:'var(--txt3)' }}>#{s.id}</span>
                  {s.refill && (
                    <span className="text-xs px-2 py-0.5 rounded-md flex items-center gap-1"
                      style={{ background:'rgba(252,211,77,0.1)', color:'#FCD34D' }}>
                      <Star size={9} fill="currentColor" /> Refill
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold mb-3" style={{ color:'var(--txt)', lineHeight:1.4 }}>
                  {s.name}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background:'var(--bg3)', color:'var(--txt3)' }}>
                    Min: {Number(s.min_order).toLocaleString()}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background:'var(--bg3)', color:'var(--txt3)' }}>
                    Max: {Number(s.max_order).toLocaleString()}
                  </span>
                  {s.type && (
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background:'var(--bg3)', color:'var(--txt3)' }}>
                      {s.type}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-xl" style={{ color:'var(--em3)', letterSpacing:'-0.5px' }}>
                      ${Number(s.rate).toFixed(2)}
                    </p>
                    <p className="text-xs" style={{ color:'var(--txt3)' }}>por 1,000 unidades</p>
                  </div>
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                    onClick={() => navigate('/dashboard/new-order')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold font-display"
                    style={{ background:'var(--em)', color:'#000' }}>
                    <Zap size={13} /> Ordenar
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
