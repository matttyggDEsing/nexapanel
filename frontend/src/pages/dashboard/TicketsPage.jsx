import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Send, X, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

const PRIORITY_CFG = {
  high:   { label: 'Alta',  color: '#F87171', bg: 'rgba(239,68,68,0.1)' },
  medium: { label: 'Media', color: '#FCD34D', bg: 'rgba(245,158,11,0.1)' },
  low:    { label: 'Baja',  color: '#93C5FD', bg: 'rgba(59,130,246,0.1)' },
}

export default function TicketsPage() {
  const [tickets, setTickets]     = useState([])
  const [selected, setSelected]   = useState(null)
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [sending, setSending]     = useState(false)
  const [input, setInput]         = useState('')
  const [showNew, setShowNew]     = useState(false)
  const [newSubject, setNewSubject]   = useState('')
  const [newMsg, setNewMsg]           = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [creating, setCreating]   = useState(false)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/tickets')
      const list = data?.data ?? data?.tickets ?? []
      setTickets(list)
      if (list.length > 0 && !selected) setSelected(list[0])
    } catch {
      // handled globally
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  const fetchMessages = useCallback(async (ticketId) => {
    if (!ticketId) return
    setMsgLoading(true)
    try {
      const { data } = await api.get(`/tickets/${ticketId}`)
      const msgs = data?.data?.messages ?? data?.messages ?? []
      setMessages(msgs)
    } catch {
      // handled globally
    } finally {
      setMsgLoading(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])
  useEffect(() => { if (selected?.id) fetchMessages(selected.id) }, [selected?.id, fetchMessages])

  const sendMessage = async () => {
    if (!input.trim() || !selected) return
    setSending(true)
    try {
      const { data } = await api.post(`/tickets/${selected.id}/reply`, { message: input.trim() })
      const newMsgs = data?.data?.messages ?? data?.messages
      if (newMsgs) {
        setMessages(newMsgs)
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(), from_admin: false, message: input.trim(),
          created_at: new Date().toISOString(),
        }])
      }
      setInput('')
    } catch {
      // handled globally
    } finally {
      setSending(false)
    }
  }

  const createTicket = async () => {
    if (!newSubject.trim() || !newMsg.trim()) { toast.error('Completa todos los campos'); return }
    setCreating(true)
    try {
      const { data } = await api.post('/tickets', {
        subject: newSubject.trim(),
        message: newMsg.trim(),
        priority: newPriority,
      })
      const ticket = data?.data ?? data
      setTickets(prev => [ticket, ...prev])
      setSelected(ticket)
      setMessages(ticket.messages ?? [])
      setShowNew(false)
      setNewSubject('')
      setNewMsg('')
      toast.success('Ticket creado exitosamente')
    } catch {
      // handled globally
    } finally {
      setCreating(false)
    }
  }

  const closeTicket = async () => {
    if (!selected) return
    try {
      await api.post(`/tickets/${selected.id}/close`)
      setSelected(prev => ({ ...prev, status: 'closed' }))
      setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'closed' } : t))
      toast.success('Ticket cerrado')
    } catch {
      // handled globally
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'ahora'
    if (diff < 3600) return `hace ${Math.floor(diff/60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`
    return d.toLocaleDateString('es')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
            Tickets de Soporte
          </h1>
          <p className="text-sm" style={{ color:'var(--txt2)' }}>Respuesta promedio: 8 minutos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTickets}
            className="p-2 rounded-xl transition-all"
            style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt2)' }}>
            <RefreshCw size={15} />
          </button>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-semibold"
            style={{ background:'var(--em)', color:'#000', boxShadow:'0 4px 20px rgba(16,185,129,0.3)' }}>
            <Plus size={16} /> Nuevo Ticket
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height:'600px' }}>
        {/* Ticket list */}
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.05 }}
          className="rounded-2xl border overflow-hidden flex flex-col"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor:'var(--border2)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color:'var(--txt3)' }}>
              {tickets.length} tickets
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background:'var(--bg4)' }} />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center" style={{ color:'var(--txt3)' }}>
                <p className="text-3xl mb-2">🎫</p>
                <p className="text-sm">Sin tickets aún</p>
              </div>
            ) : (
              tickets.map((t, i) => (
                <motion.div key={t.id}
                  initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.04 }}
                  onClick={() => setSelected(t)}
                  className="px-4 py-3.5 cursor-pointer transition-colors border-b"
                  style={{
                    borderColor:'var(--border2)',
                    background: selected?.id===t.id ? 'rgba(16,185,129,0.06)' : 'transparent',
                    borderLeft: selected?.id===t.id ? '2px solid var(--em)' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (selected?.id!==t.id) e.currentTarget.style.background='var(--bg3)' }}
                  onMouseLeave={e => { if (selected?.id!==t.id) e.currentTarget.style.background='transparent' }}>
                  <p className="text-sm font-medium truncate mb-1.5" style={{ color:'var(--txt)' }}>{t.subject}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono" style={{ color:'var(--txt3)' }}>#{t.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md"
                      style={{ background: PRIORITY_CFG[t.priority]?.bg, color: PRIORITY_CFG[t.priority]?.color }}>
                      {PRIORITY_CFG[t.priority]?.label ?? t.priority}
                    </span>
                    <span className="text-xs ml-auto" style={{ color:'var(--txt3)' }}>{formatDate(t.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {t.status==='open'
                      ? <><Clock size={10} style={{ color:'var(--em)' }}/><span className="text-xs" style={{ color:'var(--em)' }}>Abierto</span></>
                      : <><CheckCircle size={10} style={{ color:'var(--txt3)' }}/><span className="text-xs" style={{ color:'var(--txt3)' }}>Cerrado</span></>}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
          className="lg:col-span-2 rounded-2xl border flex flex-col overflow-hidden"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center" style={{ color:'var(--txt3)' }}>
              <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-sm">Selecciona un ticket</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor:'var(--border2)' }}>
                <div>
                  <p className="font-display font-semibold text-sm" style={{ color:'var(--txt)' }}>{selected.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono" style={{ color:'var(--txt3)' }}>#{selected.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md"
                      style={{ background:PRIORITY_CFG[selected.priority]?.bg, color:PRIORITY_CFG[selected.priority]?.color }}>
                      {PRIORITY_CFG[selected.priority]?.label}
                    </span>
                  </div>
                </div>
                {selected.status==='open' && (
                  <button onClick={closeTicket}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ background:'var(--bg4)', color:'var(--txt2)', border:'1px solid var(--border2)' }}>
                    Cerrar ticket
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {msgLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex ${i%2===0?'justify-start':'justify-end'}`}>
                        <div className="h-14 w-64 rounded-2xl animate-pulse" style={{ background:'var(--bg4)' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, i) => {
                      const isUser = !msg.is_staff
                      return (
                        <motion.div key={msg.id ?? i}
                          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                          transition={{ duration:.2, delay:i*.03 }}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div style={{ maxWidth:'75%' }}>
                            {!isUser && (
                              <p className="text-xs mb-1.5 ml-1" style={{ color:'var(--em3)' }}>
                                Soporte NexaPanel
                              </p>
                            )}
                            <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                              style={{
                                background: isUser ? 'rgba(16,185,129,0.12)' : 'var(--bg3)',
                                border:`1px solid ${isUser ? 'rgba(16,185,129,0.2)' : 'var(--border2)'}`,
                                color:'var(--txt)',
                                borderBottomRightRadius: isUser ? '4px' : '16px',
                                borderBottomLeftRadius:  !isUser ? '4px' : '16px',
                              }}>
                              {msg.message ?? msg.text}
                            </div>
                            <p className={`text-xs mt-1 ${isUser ? 'text-right mr-1' : 'ml-1'}`} style={{ color:'var(--txt3)' }}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Input */}
              {selected.status==='closed' ? (
                <div className="px-4 py-3 border-t" style={{ borderColor:'var(--border2)' }}>
                  <div className="flex gap-2">
                    <input value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Escribe tu mensaje... (Enter para enviar)"
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt)', caretColor:'var(--em)' }}
                      onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
                      onBlur={e => e.target.style.borderColor='var(--border2)'}
                    />
                    <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                      onClick={sendMessage} disabled={sending || !input.trim()}
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                      style={{ background:'var(--em)', color:'#000' }}>
                      {sending
                        ? <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        : <Send size={15} />}
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

      {/* New ticket modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }}
            onClick={() => setShowNew(false)}>
            <motion.div initial={{ opacity:0, scale:.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:.95 }} onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border p-6 space-y-4"
              style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg" style={{ color:'var(--txt)' }}>Nuevo Ticket</h2>
                <button onClick={() => setShowNew(false)} style={{ color:'var(--txt3)' }}><X size={18}/></button>
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium uppercase tracking-wider" style={{ color:'var(--txt3)' }}>ASUNTO</label>
                <input value={newSubject} onChange={e => setNewSubject(e.target.value)}
                  placeholder="Describe brevemente tu problema..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt)' }}
                  onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
                  onBlur={e => e.target.style.borderColor='var(--border2)'}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium uppercase tracking-wider" style={{ color:'var(--txt3)' }}>PRIORIDAD</label>
                <div className="flex gap-2">
                  {Object.entries(PRIORITY_CFG).map(([key, cfg]) => (
                    <button key={key} onClick={() => setNewPriority(key)}
                      className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: newPriority===key ? cfg.bg : 'var(--bg3)',
                        color: newPriority===key ? cfg.color : 'var(--txt3)',
                        border:`1px solid ${newPriority===key ? cfg.color+'40' : 'var(--border2)'}`,
                      }}>{cfg.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-medium uppercase tracking-wider" style={{ color:'var(--txt3)' }}>MENSAJE</label>
                <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)} rows={4}
                  placeholder="Describe tu problema en detalle..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt)' }}
                  onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
                  onBlur={e => e.target.style.borderColor='var(--border2)'}
                />
              </div>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                onClick={createTicket} disabled={creating}
                className="w-full py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background:'var(--em)', color:'#000' }}>
                {creating
                  ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/>Creando...</>
                  : 'Crear Ticket'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
