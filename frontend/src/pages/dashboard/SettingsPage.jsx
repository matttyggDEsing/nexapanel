import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Bell, Shield, Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

const TABS = [
  { id: 'profile',       label: 'Perfil',          icon: User   },
  { id: 'security',      label: 'Seguridad',        icon: Lock   },
  { id: 'notifications', label: 'Notificaciones',   icon: Bell   },
  { id: 'privacy',       label: 'Privacidad',       icon: Shield },
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

function Toggle({ value, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--txt)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--txt3)' }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
        style={{ background: value ? 'var(--em)' : 'var(--bg4)', border: '1px solid', borderColor: value ? 'var(--em)' : 'var(--border2)' }}>
        <motion.div animate={{ x: value ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{ background: value ? '#000' : 'var(--txt3)' }} />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState('profile')

  // Profile
  const [name, setName]   = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [timezone, setTimezone] = useState('America/Argentina/Buenos_Aires')
  const [lang, setLang]         = useState('es')

  // Security
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass]         = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [twoFA, setTwoFA]             = useState(false)

  // Notifications
  const [notifs, setNotifs] = useState({
    orderCompleted:  true,
    orderFailed:     true,
    ticketReply:     true,
    lowBalance:      false,
    newsletter:      false,
    apiAlerts:       true,
  })

  const [savingProfile, setSavingProfile] = useState(false)
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
  if (!currentPass || !newPass || !confirmPass) { toast.error('Completa todos los campos'); return }
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
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--txt)', letterSpacing: '-0.5px' }}>Ajustes</h1>
        <p className="text-sm" style={{ color: 'var(--txt2)' }}>Gestiona tu cuenta y preferencias.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .05 }}
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
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </motion.div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}
        className="space-y-4">

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <>
            <Section title="Foto de perfil" desc="Tu avatar en el panel.">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-display text-black"
                    style={{ background: 'linear-gradient(135deg,var(--em),var(--em2))' }}>
                    {name.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer"
                    style={{ background: 'var(--bg4)', border: '1px solid var(--border2)' }}>
                    <Camera size={11} style={{ color: 'var(--txt2)' }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--txt)' }}>{name}</p>
                  <p className="text-xs" style={{ color: 'var(--txt3)' }}>{email}</p>
                  <button className="text-xs mt-1.5" style={{ color: 'var(--em3)' }}>Cambiar foto →</button>
                </div>
              </div>
            </Section>

            <Section title="Información personal">
              <Field label="Nombre completo">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
              </Field>
              <Field label="Correo electrónico" hint="Cambiar el email requiere verificación.">
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@email.com" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Zona horaria">
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}>
                    <option value="America/Argentina/Buenos_Aires">Buenos Aires (UTC-3)</option>
                    <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                    <option value="America/Bogota">Bogotá (UTC-5)</option>
                    <option value="America/Santiago">Santiago (UTC-4)</option>
                    <option value="Europe/Madrid">Madrid (UTC+1)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </Field>
                <Field label="Idioma">
                  <select value={lang} onChange={e => setLang(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}>
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </Field>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
                onClick={saveProfile}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-semibold"
                style={{ background: 'var(--em)', color: '#000' }}>
                <Save size={14} /> Guardar cambios
              </motion.button>
            </Section>

            <Section title="Información de cuenta">
              <div className="space-y-3">
                {[
                  { label: 'ID de cuenta',    value: `#${user?.id || '1042'}` },
                  { label: 'Plan actual',      value: 'Pro' },
                  { label: 'Miembro desde',    value: 'Enero 2025' },
                  { label: 'Total gastado',    value: `$${user?.total_spent?.toFixed(2) || '76.00'}` },
                  { label: 'Total de órdenes', value: user?.total_orders || '142' },
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

        {/* SECURITY TAB */}
        {tab === 'security' && (
          <>
            <Section title="Cambiar contraseña">
              <Field label="Contraseña actual">
                <Input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="••••••••" />
              </Field>
              <Field label="Nueva contraseña" hint="Mínimo 8 caracteres, con mayúsculas y números.">
                <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
              </Field>
              <Field label="Confirmar nueva contraseña">
                <Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" />
              </Field>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
                onClick={savePassword}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-semibold"
                style={{ background: 'var(--em)', color: '#000' }}>
                <Save size={14} /> Actualizar contraseña
              </motion.button>
            </Section>

            <Section title="Autenticación de dos factores (2FA)"
              desc="Agrega una capa extra de seguridad a tu cuenta.">
              <Toggle value={twoFA} onChange={setTwoFA}
                label="Activar 2FA con app autenticadora"
                desc="Usa Google Authenticator o Authy para generar códigos temporales." />
              {twoFA && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: 'var(--em3)' }}>
                  ✓ El 2FA está activado. Tu cuenta está protegida.
                </motion.div>
              )}
            </Section>

            <Section title="Sesiones activas">
              {[
                { device: 'Chrome — Windows 11', location: 'Buenos Aires, AR', current: true,  time: 'Ahora' },
                { device: 'Safari — iPhone 15',  location: 'Buenos Aires, AR', current: false, time: 'hace 2 días' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border2)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--txt)' }}>{s.device}</p>
                    <p className="text-xs" style={{ color: 'var(--txt3)' }}>{s.location} · {s.time}</p>
                  </div>
                  {s.current
                    ? <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--em3)' }}>Sesión actual</span>
                    : <button className="text-xs px-2 py-1 rounded-lg transition-all"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                        Cerrar
                      </button>}
                </div>
              ))}
            </Section>
          </>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === 'notifications' && (
          <Section title="Preferencias de notificaciones" desc="Elige qué notificaciones quieres recibir por email.">
            <div className="space-y-4 divide-y" style={{ '--divide-color': 'var(--border2)' }}>
              {[
                { key: 'orderCompleted', label: 'Orden completada',       desc: 'Cuando una orden se procesa con éxito.' },
                { key: 'orderFailed',    label: 'Orden fallida',           desc: 'Cuando una orden es cancelada o falla.' },
                { key: 'ticketReply',    label: 'Respuesta de soporte',    desc: 'Cuando soporte responde tu ticket.' },
                { key: 'lowBalance',     label: 'Balance bajo',            desc: 'Cuando tu saldo cae por debajo de $5.' },
                { key: 'apiAlerts',      label: 'Alertas de API',          desc: 'Errores y límites de rate en tu API key.' },
                { key: 'newsletter',     label: 'Novedades de NexaPanel',  desc: 'Nuevos servicios, actualizaciones y promociones.' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="pt-4 first:pt-0">
                  <Toggle value={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} label={label} desc={desc} />
                </div>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
              onClick={() => toast.success('Preferencias guardadas')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-semibold"
              style={{ background: 'var(--em)', color: '#000' }}>
              <Save size={14} /> Guardar preferencias
            </motion.button>
          </Section>
        )}

        {/* PRIVACY TAB */}
        {tab === 'privacy' && (
          <>
            <Section title="Datos y privacidad">
              <div className="space-y-3 text-sm" style={{ color: 'var(--txt2)', lineHeight: 1.7 }}>
                <p>NexaPanel recopila únicamente los datos necesarios para el funcionamiento de la plataforma: email, nombre y datos de pago. No vendemos ni compartimos tu información con terceros.</p>
                <p>Todos los datos se almacenan cifrados y con respaldo automático diario.</p>
              </div>
              <div className="flex gap-3 flex-wrap pt-2">
                <button className="px-4 py-2 rounded-xl text-sm transition-all"
                  style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}
                  onClick={() => toast.success('Solicitud enviada. Recibirás tus datos por email en 24hs.')}>
                  Exportar mis datos
                </button>
                <button className="px-4 py-2 rounded-xl text-sm transition-all"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}
                  onClick={() => toast.error('Contacta soporte para eliminar tu cuenta.')}>
                  Eliminar cuenta
                </button>
              </div>
            </Section>
          </>
        )}
      </motion.div>
    </div>
  )
}
