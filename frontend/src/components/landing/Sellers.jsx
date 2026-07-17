import { useMemo, useState, cloneElement } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MessageCircle, CheckCircle, Loader2 } from 'lucide-react'
import { fadeUp } from '@/lib/motion'
import { useMagnetic } from '@/hooks/useMagnetic'
import { sellerService } from '@/services/sellerService'

const NETWORKS_LABELS = ['Instagram', 'TikTok', 'YouTube', 'Spotify', 'Telegram', 'Facebook']

// Reemplazá esto por tu listado real de vendedores, o cargalo con
// useEffect + tu servicio (services/) apenas monte la página.
const SELLERS = [
  { nombre: 'Martina Ríos', zona: 'Buenos Aires, Argentina', red: 'Instagram' },
  { nombre: 'Bruno Alarcón', zona: 'Córdoba, Argentina', red: 'TikTok' },
  { nombre: 'Camila Suárez', zona: 'Santiago, Chile', red: 'YouTube' },
  { nombre: 'Diego Fernández', zona: 'Bogotá, Colombia', red: 'Instagram' },
  { nombre: 'Valentina Cruz', zona: 'Lima, Perú', red: 'TikTok' },
  { nombre: 'Nicolás Paredes', zona: 'Ciudad de México, México', red: 'Telegram' },
  { nombre: 'Sofía Beltrán', zona: 'Montevideo, Uruguay', red: 'Facebook' },
]

// Reemplazá por tu casilla real. Ver nota en handleSubmit sobre cómo
// pasar esto a un envío directo (sin abrir el cliente de correo) con tu
// backend o con un servicio como EmailJS.
const DESTINATION_EMAIL = 'ventas@nexapanel.com'

const initials = (name) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-txt-secondary mb-1.5">{label}</label>
      {cloneElement(children, {
        className:
          'w-full px-3.5 py-2.5 rounded-lg bg-bg-tertiary border border-border-dim text-txt-primary text-[13.5px] outline-none transition-colors focus:border-em/40 resize-y placeholder:text-txt-muted',
      })}
    </div>
  )
}

export default function Sellers() {
  const [query, setQuery] = useState('')
  const filteredSellers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SELLERS.slice(0, 4)
    return SELLERS.filter((s) => `${s.nombre} ${s.zona} ${s.red}`.toLowerCase().includes(q))
  }, [query])

  const [form, setForm] = useState({ nombre: '', email: '', whatsapp: '', zona: '', red: '', volumen: '', mensaje: '' })
  const [formStatus, setFormStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))
  const submitBtn = useMagnetic(0.15)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { nombre, email, whatsapp, zona, red, volumen } = form
    if (!nombre || !email || !whatsapp || !zona || !red || !volumen) {
      setFormStatus({ type: 'error', message: 'Completá todos los campos obligatorios.' })
      return
    }

    setSubmitting(true)
    setFormStatus(null)

    try {
      await sellerService.applyAsSeller(form)
      setFormStatus({ type: 'ok', message: '¡Postulación enviada con éxito! Te contactaremos pronto.' })
      setForm({ nombre: '', email: '', whatsapp: '', zona: '', red: '', volumen: '', mensaje: '' })
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al enviar la postulación. Intentalo de nuevo.'
      setFormStatus({ type: 'error', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="vendedores" className="relative py-28 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div {...fadeUp(0)} className="text-center max-w-lg mx-auto mb-16">
          <span className="text-[11px] tracking-[0.2em] uppercase text-em-3 font-semibold">Red de vendedores</span>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,42px)] tracking-tight text-txt-primary mt-3 mb-4">
            Convertite en vendedor NexaPanel
          </h2>
          <p className="text-[16px] text-txt-secondary">
            Sumate a nuestra red de revendedores. Dejanos tus datos y te contactamos para armar tu cuenta.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          {/* Buscador */}
          <motion.div
            {...fadeUp(0.05)}
            className="p-6 rounded-2xl bg-bg-secondary/60 border border-border-dim backdrop-blur-xl"
          >
            <label htmlFor="seller-search" className="block text-[12px] font-semibold text-txt-secondary mb-2.5">
              Buscar vendedor por zona o red
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
              <input
                id="seller-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: Buenos Aires, Instagram, mayorista..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-bg-tertiary border border-border-dim text-txt-primary text-[13.5px] outline-none transition-colors focus:border-em/40 placeholder:text-txt-muted"
              />
            </div>

            <div className="mt-3.5 flex flex-col gap-2.5 min-h-[60px]">
              {filteredSellers.length === 0 ? (
                <p className="text-[13px] text-txt-muted px-0.5 py-2.5">
                  No encontramos vendedores para esa búsqueda todavía.
                </p>
              ) : (
                filteredSellers.map((s) => (
                  <div
                    key={s.nombre}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-bg-tertiary border border-border-dim"
                  >
                    <div className="w-[34px] h-[34px] rounded-full shrink-0 grid place-items-center bg-em/15 text-em-3 font-bold text-xs">
                      {initials(s.nombre)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold text-txt-primary truncate">{s.nombre}</div>
                      <div className="text-[12px] text-txt-muted truncate">
                        {s.zona} · {s.red}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-[12px] text-txt-muted mt-4 leading-relaxed">
              ¿No encontrás un vendedor en tu zona? Postulate vos con el formulario y sumate a la red.
            </p>
          </motion.div>

          {/* Formulario */}
          <motion.form
            {...fadeUp(0.1)}
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl bg-bg-secondary/60 border border-border-dim backdrop-blur-xl flex flex-col gap-3.5"
          >
            <div className="grid sm:grid-cols-2 gap-3.5">
              <Field label="Nombre completo">
                <input value={form.nombre} onChange={setField('nombre')} type="text" placeholder="Tu nombre" required />
              </Field>
              <Field label="Email">
                <input value={form.email} onChange={setField('email')} type="email" placeholder="tu@email.com" required />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <Field label="WhatsApp">
                <input value={form.whatsapp} onChange={setField('whatsapp')} type="tel" placeholder="+54 9 11 1234 5678" required />
              </Field>
              <Field label="Zona / país">
                <input value={form.zona} onChange={setField('zona')} type="text" placeholder="Ciudad, país" required />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <Field label="Red principal donde vendés">
                <select value={form.red} onChange={setField('red')} required>
                  <option value="" disabled>Elegí una opción</option>
                  {NETWORKS_LABELS.map((n) => <option key={n}>{n}</option>)}
                  <option>Otra / varias</option>
                </select>
              </Field>
              <Field label="Volumen estimado de ventas / mes">
                <select value={form.volumen} onChange={setField('volumen')} required>
                  <option value="" disabled>Elegí una opción</option>
                  <option>Menos de $100</option>
                  <option>$100 - $500</option>
                  <option>$500 - $2.000</option>
                  <option>Más de $2.000</option>
                </select>
              </Field>
            </div>
            <Field label="Contanos sobre tu experiencia vendiendo (opcional)">
              <textarea value={form.mensaje} onChange={setField('mensaje')} rows={3} placeholder="Hace cuánto vendés, a qué público, etc." />
            </Field>

            <motion.button
              ref={submitBtn.ref}
              onMouseMove={submitBtn.onMouseMove}
              onMouseLeave={submitBtn.onMouseLeave}
              type="submit"
              data-cursor="link"
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-[15px] font-bold text-black bg-em hover:bg-em-2 transition-colors mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MessageCircle size={16} />
              )}
              {submitting ? 'Enviando...' : 'Enviar postulación'}
            </motion.button>

            <AnimatePresence>
              {formStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p
                    role="status"
                    className={`flex items-center justify-center gap-1.5 text-[13px] text-center ${
                      formStatus.type === 'error' ? 'text-red-300' : 'text-em-3'
                    }`}
                  >
                    {formStatus.type === 'ok' && <CheckCircle size={14} />}
                    {formStatus.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
