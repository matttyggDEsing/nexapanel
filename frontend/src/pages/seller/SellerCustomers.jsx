import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Phone, Instagram, Facebook, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { sellerService } from '@/services/sellerService'

const EMPTY_FORM = { first_name: '', last_name: '', email: '', whatsapp: '', instagram: '', facebook: '', notes: '' }

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--txt3)' }}>{label}</label>
      {children}
    </div>
  )
}

function FInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
      onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
      onBlur={e => e.target.style.borderColor = 'var(--border2)'}
    />
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
function CustomerModal({ open, onClose, customer, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(customer ? { ...EMPTY_FORM, ...customer } : EMPTY_FORM)
  }, [customer, open])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.first_name || !form.last_name) { toast.error('Nombre y apellido son requeridos'); return }
    setSaving(true)
    try {
      if (customer?.id) {
        await sellerService.updateCustomer(customer.id, form)
        toast.success('Cliente actualizado')
      } else {
        await sellerService.createCustomer(form)
        toast.success('Cliente creado')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: .95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: .95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border p-6 space-y-4"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>
              {customer ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>
            <button onClick={onClose} style={{ color: 'var(--txt3)' }}><X size={18} /></button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre *"><FInput value={form.first_name} onChange={set('first_name')} placeholder="Juan" /></Field>
            <Field label="Apellido *"><FInput value={form.last_name} onChange={set('last_name')} placeholder="García" /></Field>
          </div>
          <Field label="Email"><FInput type="email" value={form.email} onChange={set('email')} placeholder="juan@email.com" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp"><FInput value={form.whatsapp} onChange={set('whatsapp')} placeholder="+54 11..." /></Field>
            <Field label="Instagram"><FInput value={form.instagram} onChange={set('instagram')} placeholder="@usuario" /></Field>
          </div>
          <Field label="Facebook"><FInput value={form.facebook} onChange={set('facebook')} placeholder="facebook.com/..." /></Field>
          <Field label="Observaciones">
            <textarea value={form.notes} onChange={set('notes')} placeholder="Notas internas..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
              style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
              Cancelar
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold font-display transition-all disabled:opacity-50"
              style={{ background: 'var(--em)', color: '#000' }}>
              {saving ? 'Guardando...' : customer ? 'Actualizar' : 'Crear cliente'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SellerCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [modal, setModal] = useState({ open: false, customer: null })
  const [deleting, setDeleting] = useState(null)
  const { confirm: confirmDelete, modal: confirmModal } = useConfirm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sellerService.getCustomers({ page, perPage: 12, search: search || undefined })
      setCustomers(res.data.data || [])
      setPagination(res.data.pagination || { total: 0, totalPages: 1 })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al cargar clientes'
      toast.error(msg)
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { setPage(1) }, [search])
  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    const ok = await confirmDelete('Eliminar cliente', '¿Eliminar este cliente? Esta acción no se puede deshacer.', { confirmText: 'Eliminar', variant: 'danger' }); if (!ok) return
    setDeleting(id)
    try {
      await sellerService.deleteCustomer(id)
      toast.success('Cliente eliminado')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al eliminar')
    } finally { setDeleting(null) }
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>Clientes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--txt2)' }}>{pagination.total} clientes registrados</p>
        </div>
        <button onClick={() => setModal({ open: true, customer: null })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold font-display"
          style={{ background: 'var(--em)', color: '#000' }}>
          <Plus size={14} /> Nuevo cliente
        </button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .05 }}
        className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--txt3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o WhatsApp..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.35)'}
          onBlur={e => e.target.style.borderColor = 'var(--border2)'}
        />
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--txt3)' }}>
          <Users size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">{search ? `Sin resultados para "${search}"` : 'Aún no tenés clientes. ¡Creá el primero!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {customers.map((c, i) => (
              <motion.div key={c.id} layout
                initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: .95 }} transition={{ duration: .2, delay: i * .03 }}
                className="rounded-2xl border p-5 hover-glow transition-all"
                style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>

                {/* Avatar + name */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 text-black"
                    style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
                    {c.first_name?.charAt(0)?.toUpperCase()}{c.last_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--txt)' }}>
                      {c.first_name} {c.last_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--txt3)' }}>
                      {c.total_orders} compra{c.total_orders !== 1 ? 's' : ''} · ${Number(c.total_spent || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 mb-4">
                  {c.email && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--txt3)' }}>
                      <Mail size={11} /> <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.whatsapp && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--txt3)' }}>
                      <Phone size={11} /> <span>{c.whatsapp}</span>
                    </div>
                  )}
                  {c.instagram && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--txt3)' }}>
                      <Instagram size={11} /> <span>{c.instagram}</span>
                    </div>
                  )}
                  {c.facebook && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--txt3)' }}>
                      <Facebook size={11} /> <span className="truncate">{c.facebook}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border2)' }}>
                  <button onClick={() => setModal({ open: true, customer: c })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
                    <Edit2 size={12} /> Editar
                  </button>
                  <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <Trash2 size={12} /> {deleting === c.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs" style={{ color: 'var(--txt3)' }}>
            Página {page} de {pagination.totalPages} · {pagination.total} clientes
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg disabled:opacity-30 transition-all"
              style={{ background: 'var(--bg2)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              className="p-2 rounded-lg disabled:opacity-30 transition-all"
              style={{ background: 'var(--bg2)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {confirmModal}
      <CustomerModal
        open={modal.open}
        customer={modal.customer}
        onClose={() => setModal({ open: false, customer: null })}
        onSaved={load}
      />
    </div>
  )
}
