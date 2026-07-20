import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserX, UserCheck, DollarSign, ChevronLeft, ChevronRight, X, RefreshCw, Trash2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { useConfirm } from '@/components/ui/ConfirmModal'

function BalanceModal({ user, onClose, onSaved }) {
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!amount || isNaN(amount)) { toast.error('Ingresa un monto válido'); return }
    setLoading(true)
    try {
      await api.post(`/admin/users/${user.id}/balance`, { action, amount: parseFloat(amount) })
      toast.success('Balance actualizado')
      onSaved()
      onClose()
    } catch {
      // handled globally
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} onClick={onClose}/>
      <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border p-5"
        style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold" style={{ color:'var(--txt)' }}>Balance — {user.name}</h3>
          <button onClick={onClose} style={{ color:'var(--txt3)' }}><X size={16}/></button>
        </div>
        <p className="text-sm mb-4" style={{ color:'var(--txt2)' }}>
          Actual: <span style={{ color:'var(--em3)' }}>${Number(user.balance).toFixed(2)}</span>
        </p>
        <div className="flex gap-2 mb-4">
          {[
            { key:'add',      label:'Añadir',    color:'var(--em)' },
            { key:'subtract', label:'Quitar',    color:'#F87171'   },
            { key:'set',      label:'Establecer',color:'#60A5FA'   },
          ].map(a => (
            <button key={a.key} onClick={() => setAction(a.key)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: action===a.key ? `${a.color}20` : 'var(--bg3)',
                color: action===a.key ? a.color : 'var(--txt3)',
                border:`1px solid ${action===a.key ? a.color+'50' : 'var(--border2)'}`,
              }}>{a.label}</button>
          ))}
        </div>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color:'var(--txt3)' }}>$</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" min="0"
            className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt)' }}
            onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor='var(--border2)'}
          />
        </div>
        <button onClick={handleSave} disabled={loading}
          className="w-full py-2.5 rounded-xl font-display font-bold text-sm disabled:opacity-50"
          style={{ background:'var(--em)', color:'#000' }}>
          {loading ? 'Guardando...' : 'Guardar cambio'}
        </button>
      </motion.div>
    </div>
  )
}

export default function AdminUsers() {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page:1, totalPages:1, total:0 })
  const [balanceUser, setBalanceUser] = useState(null)
  const [roleDropdown, setRoleDropdown] = useState(null)
  const roleRef = useRef(null)
  const { confirm, modal } = useConfirm()

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users', {
        params: { page: pagination.page, perPage: 15, search, status: statusFilter || undefined, ...params }
      })
      setUsers(data?.data ?? data?.users ?? [])
      const pg = data?.pagination
      if (pg) setPagination(pg)
    } catch {
      // handled globally
    } finally {
      setLoading(false)
    }
  }, [pagination.page, search, statusFilter])

  useEffect(() => { fetchUsers() }, [pagination.page, search, statusFilter]) // eslint-disable-line

  useEffect(() => {
    const onClickOutside = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleDropdown(null)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleSearch = (e) => {
    if (e.key === 'Enter') { setSearch(searchInput); setPagination(p => ({...p, page:1})) }
  }

  const toggleBan = async (user) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned'
    try {
      await api.patch(`/admin/users/${user.id}/status`, { status: newStatus })
      toast.success(newStatus === 'banned' ? 'Usuario baneado' : 'Usuario desbaneado')
      fetchUsers()
    } catch {
      // handled globally
    }
  }

  const deleteUser = async (user) => {
    const confirmed = await confirm(
      'Eliminar usuario',
      `¿Eliminar a "${user.name}" (${user.email})? Esta acción no se puede deshacer.`,
      { confirmText: 'Eliminar', variant: 'danger' }
    )
    if (!confirmed) return
    try {
      await api.delete(`/admin/users/${user.id}`)
      toast.success('Usuario eliminado')
      fetchUsers()
    } catch {
      // handled globally
    }
  }

  const changeRole = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role })
      toast.success('Rol actualizado')
      setRoleDropdown(null)
      fetchUsers()
    } catch {
      // handled globally
    }
  }

  const ROLE_CFG = {
    admin:   { label:'Admin',    bg:'rgba(139,92,246,0.12)', color:'#A78BFA' },
    seller:  { label:'Vendedor', bg:'rgba(16,185,129,0.12)', color:'#34D399' },
    staff:   { label:'Staff',    bg:'rgba(252,211,77,0.1)',  color:'#FCD34D' },
    user:    { label:'Usuario',  bg:'rgba(96,165,250,0.1)',  color:'#93C5FD' },
  }

  const ALL_ROLES = ['user', 'seller', 'staff', 'admin']

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
          Usuarios
        </h1>
        <p className="text-sm" style={{ color:'var(--txt2)' }}>
          {loading ? '—' : `${pagination.total} usuarios registrados`}
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--txt3)' }}/>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={handleSearch}
            placeholder="Nombre o email (Enter)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background:'var(--bg2)', border:'1px solid var(--border2)', color:'var(--txt)', caretColor:'var(--em)' }}
            onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
            onBlur={e => e.target.style.borderColor='var(--border2)'}
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { key:'',       label:'Todos'    },
            { key:'active', label:'Activos'  },
            { key:'banned', label:'Baneados' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => { setStatusFilter(key); setPagination(p => ({...p, page:1})) }}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: statusFilter===key ? 'rgba(16,185,129,0.1)' : 'var(--bg2)',
                border:`1px solid ${statusFilter===key ? 'rgba(16,185,129,0.25)' : 'var(--border2)'}`,
                color: statusFilter===key ? 'var(--em3)' : 'var(--txt2)',
              }}>{label}</button>
          ))}
        </div>
        <button onClick={() => fetchUsers()}
          className="p-2.5 rounded-xl transition-all"
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
                {['ID','Usuario','Balance','Órdenes','Gastado','Rol','Estado','Acciones'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                    style={{ color:'var(--txt3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border2)' }}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded animate-pulse" style={{ background:'var(--bg4)', width: j===1?'120px':'60px' }}/>
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16" style={{ color:'var(--txt3)' }}>
                    <p className="text-sm">No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {users.map((user, i) => (
                    <motion.tr key={user.id}
                      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                      exit={{ opacity:0 }} transition={{ duration:.2, delay:i*.03 }}
                      style={{ borderBottom:'1px solid var(--border2)' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td className="px-4 py-3.5 text-xs font-mono" style={{ color:'var(--txt3)' }}>#{user.id}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium" style={{ color:'var(--txt)' }}>{user.name}</p>
                        <p className="text-xs" style={{ color:'var(--txt3)' }}>{user.email}</p>
                      </td>
                      <td className="px-4 py-3.5 font-display font-bold text-sm" style={{ color:'var(--em3)' }}>
                        ${Number(user.balance ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-sm" style={{ color:'var(--txt2)' }}>
                        {user.total_orders ?? 0}
                      </td>
                      <td className="px-4 py-3.5 text-sm" style={{ color:'var(--txt2)' }}>
                        ${Number(user.total_spent ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 relative">
                        <button onClick={() => setRoleDropdown(roleDropdown === user.id ? null : user.id)}
                          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium transition-all"
                          style={{
                            background: ROLE_CFG[user.role]?.bg ?? 'var(--bg4)',
                            color: ROLE_CFG[user.role]?.color ?? 'var(--txt3)',
                          }}>
                          {ROLE_CFG[user.role]?.label ?? user.role}
                          <Shield size={10} />
                        </button>
                        {roleDropdown === user.id && (
                          <div ref={roleRef}
                            className="absolute z-30 top-full left-0 mt-1 rounded-xl border shadow-xl overflow-hidden"
                            style={{ background:'var(--bg2)', borderColor:'var(--border2)', minWidth:130 }}>
                            {ALL_ROLES.map(r => (
                              <button key={r} onClick={() => changeRole(user.id, r)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-all"
                                style={{
                                  color: r === user.role ? 'var(--em3)' : 'var(--txt)',
                                  background: r === user.role ? 'rgba(16,185,129,0.06)' : 'transparent',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                                onMouseLeave={e => { if (r !== user.role) e.currentTarget.style.background='transparent' }}>
                                <span className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: ROLE_CFG[r]?.color ?? 'var(--txt3)' }} />
                                {ROLE_CFG[r]?.label ?? r}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`badge ${user.status==='active' ? 'badge-active' : 'badge-cancelled'}`}>
                          {user.status==='active' ? 'Activo' : 'Baneado'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setBalanceUser(user)} title="Editar balance"
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background:'rgba(16,185,129,0.08)', color:'var(--em3)', border:'1px solid rgba(16,185,129,0.15)' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background='rgba(16,185,129,0.08)'}>
                            <DollarSign size={13}/>
                          </button>
                          <button onClick={() => toggleBan(user)}
                            title={user.status==='active' ? 'Banear' : 'Desbanear'}
                            className="p-1.5 rounded-lg transition-all"
                            style={{
                              background: user.status==='active' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                              color: user.status==='active' ? '#F87171' : 'var(--em3)',
                              border: `1px solid ${user.status==='active' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}`,
                            }}>
                            {user.status==='active' ? <UserX size={13}/> : <UserCheck size={13}/>}
                          </button>
                          <button onClick={() => deleteUser(user)} title="Eliminar usuario"
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background:'rgba(239,68,68,0.08)', color:'#F87171', border:'1px solid rgba(239,68,68,0.15)' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}>
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor:'var(--border2)' }}>
            <p className="text-xs" style={{ color:'var(--txt3)' }}>
              Página {pagination.page} de {pagination.totalPages} · {pagination.total} usuarios
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPagination(p => ({...p, page: p.page-1}))} disabled={pagination.page===1}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ background:'var(--bg3)', color:'var(--txt2)' }}>
                <ChevronLeft size={14}/>
              </button>
              <button onClick={() => setPagination(p => ({...p, page: p.page+1}))} disabled={pagination.page===pagination.totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ background:'var(--bg3)', color:'var(--txt2)' }}>
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {balanceUser && (
        <BalanceModal user={balanceUser} onClose={() => setBalanceUser(null)} onSaved={() => fetchUsers()}/>
      )}
      {modal}
    </div>
  )
}
