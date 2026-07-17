import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Copy, RefreshCw, Eye, EyeOff, CheckCircle, Zap, Code2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

const ENDPOINTS = [
  {
    action: 'services',
    desc: 'Obtener todos los servicios disponibles',
    body: `key=TU_API_KEY&action=services`,
    response: `[{ "service": 1, "name": "Instagram Followers", "rate": "0.90", "min": "100", "max": "100000" }]`,
  },
  {
    action: 'add',
    desc: 'Crear una nueva orden',
    body: `key=TU_API_KEY&action=add&service=1&link=https://instagram.com/user&quantity=1000`,
    response: `{ "order": 23841 }`,
  },
  {
    action: 'status',
    desc: 'Ver estado de una orden',
    body: `key=TU_API_KEY&action=status&order=23841`,
    response: `{ "charge": "0.90", "start_count": "847", "status": "Active", "remains": "153", "currency": "USD" }`,
  },
  {
    action: 'balance',
    desc: 'Consultar balance de cuenta',
    body: `key=TU_API_KEY&action=balance`,
    response: `{ "balance": "102.20", "currency": "USD" }`,
  },
]

const CODE_EXAMPLES = {
  javascript: `const response = await fetch('https://nexapanel.io/api/v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    key: 'TU_API_KEY',
    action: 'add',
    service: 1,
    link: 'https://instagram.com/user',
    quantity: 1000
  })
})
const data = await response.json()
// { order: 23841 }`,

  php: `$response = file_get_contents('https://nexapanel.io/api/v2', false,
  stream_context_create(['http' => [
    'method'  => 'POST',
    'header'  => 'Content-Type: application/x-www-form-urlencoded',
    'content' => http_build_query([
      'key'      => 'TU_API_KEY',
      'action'   => 'add',
      'service'  => 1,
      'link'     => 'https://instagram.com/user',
      'quantity' => 1000
    ])
  ]])
);
$data = json_decode($response, true);
// $data['order'] === 23841`,

  python: `import requests

response = requests.post('https://nexapanel.io/api/v2', data={
    'key':      'TU_API_KEY',
    'action':   'add',
    'service':  1,
    'link':     'https://instagram.com/user',
    'quantity': 1000
})
data = response.json()
# data['order'] == 23841`,
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copiado')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
      style={{ background:'var(--bg4)', color: copied ? 'var(--em3)' : 'var(--txt3)', border:'1px solid var(--border2)' }}>
      {copied ? <CheckCircle size={12}/> : <Copy size={12}/>}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

export default function ApiPage() {
  const [apiKey, setApiKey]     = useState('')
  const [showKey, setShowKey]   = useState(false)
  const [logs, setLogs]         = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [regen, setRegen]       = useState(false)
  const [activeTab, setActiveTab] = useState('javascript')
  const [activeEp, setActiveEp]   = useState(0)

  const fetchApiData = useCallback(async () => {
    setLoading(true)
    try {
      const [keyRes, logsRes, statsRes] = await Promise.allSettled([
        api.get('/api-key'),
        api.get('/api-key/logs', { params: { perPage: 8 } }),
        api.get('/api-key/stats'),
      ])
      if (keyRes.status === 'fulfilled') {
        const k = keyRes.value.data?.data?.api_key ?? keyRes.value.data?.api_key ?? ''
        setApiKey(k)
      }
      if (logsRes.status === 'fulfilled') {
        setLogs(logsRes.value.data?.data ?? logsRes.value.data?.logs ?? [])
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data ?? statsRes.value.data)
      }
    } catch {
      // handled globally
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApiData() }, [fetchApiData])

  const handleRegen = async () => {
    setRegen(true)
    try {
      const { data } = await api.post('/api-key/regenerate')
      const newKey = data?.data?.api_key ?? data?.api_key ?? ''
      setApiKey(newKey)
      toast.success('API Key regenerada exitosamente')
    } catch {
      // handled globally
    } finally {
      setRegen(false)
    }
  }

  const maskedKey = apiKey
    ? apiKey.slice(0, 8) + '•'.repeat(Math.max(0, apiKey.length - 8))
    : '••••••••••••••••••••••••••••••••'

  const displayKey = apiKey || ''

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>API</h1>
        <p className="text-sm" style={{ color:'var(--txt2)' }}>
          Endpoint base:{' '}
          <code style={{ color:'var(--em3)', background:'var(--bg3)', padding:'2px 6px', borderRadius:'4px' }}>
            {window.location.origin}/api/v2
          </code>
        </p>
      </motion.div>

      {/* API Key */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }}
        className="rounded-2xl border p-5"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} style={{ color:'var(--em)' }}/>
          <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>Tu API Key</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background:'var(--bg3)', border:'1px solid var(--border2)' }}>
            <Code2 size={15} style={{ color:'var(--txt3)' }}/>
            {loading ? (
              <div className="h-4 flex-1 rounded animate-pulse" style={{ background:'var(--bg4)' }}/>
            ) : (
              <code className="flex-1 text-sm font-mono" style={{ color:'var(--txt)' }}>
                {showKey ? displayKey : maskedKey}
              </code>
            )}
            <button onClick={() => setShowKey(v => !v)} style={{ color:'var(--txt3)' }}>
              {showKey ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          {!loading && <CopyButton text={displayKey}/>}
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
            onClick={handleRegen} disabled={regen}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ background:'var(--bg3)', color:'var(--txt2)', border:'1px solid var(--border2)' }}>
            <motion.div animate={{ rotate: regen ? 360 : 0 }}
              transition={{ duration:1, repeat: regen ? Infinity : 0, ease:'linear' }}>
              <RefreshCw size={14}/>
            </motion.div>
            Regenerar
          </motion.button>
        </div>
        <p className="text-xs mt-3" style={{ color:'var(--txt3)' }}>
          ⚠️ Nunca compartas tu API key. Si la regeneras, la anterior deja de funcionar inmediatamente.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Requests hoy',    value: stats?.today ?? '—',   color:'var(--em)'  },
          { label:'Tiempo promedio', value: stats?.avgMs ? `${stats.avgMs}ms` : '—', color:'#60A5FA' },
          { label:'Tasa de éxito',   value: stats?.successRate ? `${stats.successRate}%` : '—', color:'#A78BFA' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label}
            initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1+i*.05 }}
            className="rounded-xl border p-4 text-center"
            style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
            {loading
              ? <div className="h-8 w-16 rounded-lg animate-pulse mx-auto mb-1" style={{ background:'var(--bg4)' }}/>
              : <p className="font-display font-bold text-2xl mb-1" style={{ color, letterSpacing:'-1px' }}>{value}</p>
            }
            <p className="text-xs" style={{ color:'var(--txt3)' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Endpoints */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'var(--border2)' }}>
          <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>Endpoints</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="border-r" style={{ borderColor:'var(--border2)' }}>
            {ENDPOINTS.map((ep, i) => (
              <div key={ep.action} onClick={() => setActiveEp(i)}
                className="px-5 py-4 cursor-pointer transition-colors border-b"
                style={{
                  borderColor:'var(--border2)',
                  background: activeEp===i ? 'rgba(16,185,129,0.06)' : 'transparent',
                  borderLeft: activeEp===i ? '2px solid var(--em)' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (activeEp!==i) e.currentTarget.style.background='var(--bg3)' }}
                onMouseLeave={e => { if (activeEp!==i) e.currentTarget.style.background='transparent' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold"
                    style={{ background:'rgba(16,185,129,0.1)', color:'var(--em3)' }}>POST</span>
                  <code className="text-sm font-mono" style={{ color:'var(--txt)' }}>action={ep.action}</code>
                </div>
                <p className="text-xs" style={{ color:'var(--txt3)' }}>{ep.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color:'var(--txt3)' }}>REQUEST</p>
                <CopyButton text={ENDPOINTS[activeEp].body}/>
              </div>
              <pre className="p-3 rounded-xl text-xs overflow-x-auto"
                style={{ background:'var(--bg)', color:'var(--em3)', border:'1px solid var(--border2)', fontFamily:'SF Mono,Menlo,monospace', lineHeight:1.7 }}>
                {ENDPOINTS[activeEp].body}
              </pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color:'var(--txt3)' }}>RESPONSE</p>
                <CopyButton text={ENDPOINTS[activeEp].response}/>
              </div>
              <pre className="p-3 rounded-xl text-xs overflow-x-auto"
                style={{ background:'var(--bg)', color:'#93C5FD', border:'1px solid var(--border2)', fontFamily:'SF Mono,Menlo,monospace', lineHeight:1.7 }}>
                {ENDPOINTS[activeEp].response}
              </pre>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Code examples */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border2)' }}>
          <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>Ejemplos de código</h2>
          <div className="flex gap-1">
            {Object.keys(CODE_EXAMPLES).map(lang => (
              <button key={lang} onClick={() => setActiveTab(lang)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background: activeTab===lang ? 'rgba(16,185,129,0.12)' : 'var(--bg3)',
                  color: activeTab===lang ? 'var(--em3)' : 'var(--txt3)',
                  border:`1px solid ${activeTab===lang ? 'rgba(16,185,129,0.25)' : 'transparent'}`,
                }}>{lang}</button>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute top-3 right-4 z-10">
            <CopyButton text={CODE_EXAMPLES[activeTab]}/>
          </div>
          <pre className="p-5 text-xs overflow-x-auto"
            style={{ color:'var(--txt2)', fontFamily:'SF Mono,Menlo,monospace', lineHeight:1.8, maxHeight:'260px' }}>
            {CODE_EXAMPLES[activeTab]}
          </pre>
        </div>
      </motion.div>

      {/* Recent logs */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.25 }}
        className="rounded-2xl border overflow-hidden"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'var(--border2)' }}>
          <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>Logs recientes</h2>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background:'var(--bg4)' }}/>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center" style={{ color:'var(--txt3)' }}>
            <p className="text-sm">Sin logs aún. Haz tu primer request a la API.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border2)', background:'var(--bg3)' }}>
                {['Acción','Estado','Resp.','Hora'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color:'var(--txt3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const dateStr = log.created_at
                  ? new Date(log.created_at).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
                  : '—'
                return (
                  <motion.tr key={log.id ?? i}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*.03 }}
                    style={{ borderBottom:'1px solid var(--border2)' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td className="px-5 py-3">
                      <code className="text-sm" style={{ color:'var(--em3)' }}>action={log.action}</code>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${log.status_code < 300 ? 'badge-completed' : 'badge-cancelled'}`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-mono"
                      style={{ color: log.response_ms < 100 ? 'var(--em3)' : 'var(--txt2)' }}>
                      {log.response_ms ?? '—'}ms
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color:'var(--txt3)' }}>{dateStr}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  )
}
