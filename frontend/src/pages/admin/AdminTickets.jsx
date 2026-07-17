import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Send, X, RefreshCw, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

const PRIORITY_CFG = {
  high:   { label: 'Alta',    bg: 'rgba(239,68,68,0.1)',  color: '#FCA5A5' },
  medium: { label: 'Media',   bg: 'rgba(245,158,11,0.1)', color: '#FCD34D' },
  low:    { label: 'Baja',    bg: 'rgba(99,102,241,0.1)', color: '#A5B4FC' },
  urgent: { label: 'Urgente', bg: 'rgba(239,68,68,0.18)', color: '#F87171' },
}

const STATUS_CFG = {
  open:    { label: 'Abierto',  color: 'var(--em3)' },
  pending: { label: 'Pendiente',color: '#FCD34D'    },
  closed:  { label: 'Cerrado', color: 'var(--txt3)' },
}

const formatDate = (d) => d ? new Date(d).toLocaleString('es-AR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—'

export default function AdminTickets() {
  const [tickets, setTickets]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected]     = useState(null)
  const [messages, setMessages]     = useState([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [reply, setReply]           = useState('')
  const [sending, setSending]       = useState(false)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/tickets', {
        params: { status: filterStatus || undefined, perPage: 50 }
      })
      setTickets(data?.data ?? data?.tickets ?? [])
    } catch {
      toast.error('Error cargando tickets')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const selectTicket = async (ticket) => {
    setSelected(ticket)
    setMsgLoading(true)
    try {
      const { data } = await api.get(`/admin/tickets/${ticket.id}/messages`)
      setMessages(data?.data ?? [])
    } catch {
      setMessages([])
    } finally {
      setMsgLoading(false)
    }
  }

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      await api.post(`/admin/tickets/${selected.id}/reply`, { message: reply.trim() })
      const { data } = await api.get(`/admin/tickets/${selected.id}/messages`)
      setMessages(data?.data ?? [])
      setReply('')
      toast.success('Respuesta enviada')
    } catch {
      toast.error('Error enviando respuesta')
    } finally {
      setSending(false)
    }
  }

  const closeTicket = async (id) => {
    try {
      await api.post(`/admin/tickets/${id}/close`)
      toast.success('Ticket cerrado')
      fetchTickets()
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'closed' }))
    } catch {
      toast.error('Error cerrando ticket')
    }
  }

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase()
    return !q || t.subject?.toLowerCase().includes(q) || t.user_email?.includes(q) || String(t.id).includes(q)
  })

  const openCount = tickets.filter(t => t.status === 'open').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>Tickets</h1>
        <p className="text-sm" style={{ color:'var(--txt2)' }}>
          {loading ? '—' : `${openCount} tickets abiertos`}
        </p>
      </motion.div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--txt3)' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tickets..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt)' }}
            onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor='var(--border2)'}/>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <option value="">Todos</option>
          <option value="open">Abiertos</option>
          <option value="pending">Pendientes</option>
          <option value="closed">Cerrados</option>
        </select>
        <button onClick={fetchTickets} className="p-2.5 rounded-xl transition-all"
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
          <RefreshCw size={14}/>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight:'500px' }}>
        {/* List */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="rounded-2xl border overflow-hidden"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor:'var(--border2)' }}>
            <p className="text-sm font-medium" style={{ color:'var(--txt2)' }}>{filtered.length} tickets</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight:'600px' }}>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b" style={{ borderColor:'var(--border2)' }}>
                  <div className="h-4 w-3/4 rounded animate-pulse mb-2" style={{ background:'var(--bg4)' }}/>
                  <div className="h-3 w-1/2 rounded animate-pulse" style={{ background:'var(--bg4)' }}/>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center" style={{ color:'var(--txt3)' }}>
                <p className="text-3xl mb-2">🎫</p>
                <p className="text-sm">Sin tickets</p>
              </div>
            ) : (
              filtered.map(t => (
                <motion.div key={t.id} onClick={() => selectTicket(t)}
                  className="p-4 cursor-pointer border-b transition-all"
                  style={{
                    borderColor:'var(--border2)',
                    background: selected?.id===t.id ? 'rgba(16,185,129,0.06)' : 'transparent',
                    borderLeft: selected?.id===t.id ? '2px solid var(--em)' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if(selected?.id!==t.id) e.currentTarget.style.background='var(--bg3)' }}
                  onMouseLeave={e => { if(selected?.id!==t.id) e.currentTarget.style.background='transparent' }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-mono" style={{ color:'var(--txt3)' }}>#{t.id}</p>
                    <span className="text-xs px-2 py-0.5 rounded-md"
                      style={{ background:PRIORITY_CFG[t.priority]?.bg, color:PRIORITY_CFG[t.priority]?.color }}>
                      {PRIORITY_CFG[t.priority]?.label ?? t.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate mb-1" style={{ color:'var(--txt)' }}>{t.subject}</p>
                  <p className="text-xs truncate mb-1.5" style={{ color:'var(--txt3)' }}>{t.user_email ?? t.user_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: STATUS_CFG[t.status]?.color ?? 'var(--txt3)' }}>
                      {STATUS_CFG[t.status]?.label ?? t.status}
                    </span>
                    <span className="text-xs" style={{ color:'var(--txt3)' }}>{formatDate(t.updated_at)}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
          className="lg:col-span-2 rounded-2xl border flex flex-col overflow-hidden"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)', minHeight:'500px' }}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center" style={{ color:'var(--txt3)' }}>
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-sm">Selecciona un ticket</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor:'var(--border2)' }}>
                <div>
                  <p className="font-display font-semibold text-sm" style={{ color:'var(--txt)' }}>{selected.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color:'var(--txt3)' }}>{selected.user_email}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md"
                      style={{ background:PRIORITY_CFG[selected.priority]?.bg, color:PRIORITY_CFG[selected.priority]?.color }}>
                      {PRIORITY_CFG[selected.priority]?.label}
                    </span>
                  </div>
                </div>
                {selected.status !== 'closed' && (
                  <button onClick={() => closeTicket(selected.id)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    style={{ background:'var(--bg4)', color:'var(--txt2)', border:'1px solid var(--border2)' }}>
                    <CheckCircle size={12}/> Cerrar ticket
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {msgLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className={`flex ${i%2===0?'justify-start':'justify-end'}`}>
                      <div className="h-14 w-64 rounded-2xl animate-pulse" style={{ background:'var(--bg4)' }}/>
                    </div>
                  ))
                ) : messages.length === 0 ? (
                  <div className="text-center py-8" style={{ color:'var(--txt3)' }}>
                    <p className="text-sm">Sin mensajes</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, i) => {
                      const isStaff = !!msg.is_staff
                      return (
                        <motion.div key={msg.id ?? i}
                          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                          className={`flex ${isStaff ? 'justify-start' : 'justify-end'}`}>
                          <div style={{ maxWidth:'75%' }}>
                            {isStaff && (
                              <p className="text-xs mb-1.5 ml-1" style={{ color:'var(--em3)' }}>
                                {msg.author_name ?? 'Soporte'}
                              </p>
                            )}
                            <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                              style={{
                                background: isStaff ? 'var(--bg3)' : 'rgba(16,185,129,0.12)',
                                border:`1px solid ${isStaff ? 'var(--border2)' : 'rgba(16,185,129,0.2)'}`,
                                color:'var(--txt)',
                                borderBottomLeftRadius:  isStaff ? '4px' : '16px',
                                borderBottomRightRadius: !isStaff ? '4px' : '16px',
                              }}>
                              {msg.message}
                            </div>
                            <p className={`text-xs mt-1 ${isStaff ? 'ml-1' : 'text-right mr-1'}`} style={{ color:'var(--txt3)' }}>
                              {formatDate(msg.created_at)}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
              </div>

              {selected.status !== 'closed' ? (
                <div className="px-4 py-3 border-t" style={{ borderColor:'var(--border2)' }}>
                  <div className="flex gap-2">
                    <input value={reply} onChange={e => setReply(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendReply()}
                      placeholder="Responder... (Enter para enviar)"
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt)', caretColor:'var(--em)' }}
                      onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
                      onBlur={e => e.target.style.borderColor='var(--border2)'}/>
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                      onClick={sendReply} disabled={sending || !reply.trim()}
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                      style={{ background:'var(--em)', color:'#000' }}>
                      {sending
                        ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"/>
                        : <Send size={15}/>}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 border-t text-center" style={{ borderColor:'var(--border2)' }}>
                  <p className="text-sm" style={{ color:'var(--txt3)' }}>Este ticket está cerrado.</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
