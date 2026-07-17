import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

const TABS = [
  { id: 'profile',  label: 'Perfil',     icon: User },
  { id: 'security', label: 'Seguridad',  icon: Lock },
]

function Section({ title, desc, children }) {
  return (
    <div className="rounded-2xl border p-5 space-y-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}>
      <div className="pb-4 border-b" style={{ borderColor: 'var(--border2)' }}>
        <h3 className="font-display font-semibold text-base" style={{ color: 'var(--txt)' }}>{title}</h3>
        {desc && <p className="text-sm mt-0.5" style={{ color: 'var(--txt2)' }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--txt3)' }}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1.5" style={{ color: 'var(--txt3)' }}>{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder, disabled }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
      style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)', caretColor: 'var(--em)' }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = 'rgba(16,185,129,0.35)' }}
      onBlur={e => e.target.style.borderColor = 'var(--border2)'}
    />
  )
}

export default function SellerSettings() {
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState('profile')

  const [name, setName]   = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass]         = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  const [savingProfile, setSavingProfile]   = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const saveProfile = async () => {
    if (!name.trim()) { toast.error('El nombre es requerido'); return }
    setSavingProfile(true)
    try {
      const { data } = await api.patch('/auth/profile', { name: name.trim(), email: email.trim() })
      if (data?.data) updateUser(data.data)
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar')
    } finally { setSavingProfile(false) }
  }

  const savePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) { toast.error('Completá todos los campos'); return }
    if (newPass !== confirmPass) { toast.error('Las contraseñas no coinciden'); return }
    if (newPass.length < 8) { toast.error('Mínimo 8 caracteres'); return }
    setSavingPassword(true)
    try {
      await api.patch('/auth/password', { currentPassword: currentPass, newPassword: newPass })
      toast.success('Contraseña actualizada')
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al actualizar')
    } finally { setSavingPassword(false) }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>
          Configuración
        </h1>
        <p className="text-sm" style={{ color: 'var(--txt2)' }}>Gestioná tu cuenta de vendedor.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border2)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === id ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: tab === id ? 'var(--em3)' : 'var(--txt3)',
              border: `1px solid ${tab === id ? 'rgba(16,185,129,0.2)' : 'transparent'}`,
            }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </motion.div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        className="space-y-4">

        {tab === 'profile' && (
          <>
            <Section title="Datos personales" desc="Tu información visible para tus clientes y en recibos.">
              <div className="flex items-center gap-5 pb-2">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-display text-black flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,var(--em),var(--em2))' }}>
                  {name.charAt(0)?.toUpperCase() || 'V'}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--txt)' }}>{name || 'Vendedor'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--txt3)' }}>Rol: Vendedor</p>
                </div>
              </div>
              <Field label="Nombre completo">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
              </Field>
              <Field label="Email" hint="Se usa para iniciar sesión y recibir notificaciones.">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
              </Field>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={saveProfile} disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-semibold disabled:opacity-50"
                style={{ background: 'var(--em)', color: '#000' }}>
                <Save size={14} /> {savingProfile ? 'Guardando...' : 'Guardar cambios'}
              </motion.button>
            </Section>

            <Section title="Información de cuenta">
              <div className="space-y-3">
                {[
                  { label: 'ID de cuenta', value: `#${user?.id ?? '—'}` },
                  { label: 'Rol',          value: 'Vendedor' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b"
                    style={{ borderColor: 'var(--border2)' }}>
                    <span className="text-sm" style={{ color: 'var(--txt2)' }}>{label}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--txt)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {tab === 'security' && (
          <Section title="Cambiar contraseña">
            <Field label="Contraseña actual">
              <Input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="Nueva contraseña" hint="Mínimo 8 caracteres.">
              <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="Confirmar nueva contraseña">
              <Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" />
            </Field>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={savePassword} disabled={savingPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-semibold disabled:opacity-50"
              style={{ background: 'var(--em)', color: '#000' }}>
              <Save size={14} /> {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
            </motion.button>
          </Section>
        )}
      </motion.div>
    </div>
  )
}
