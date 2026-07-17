import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

export default function MercadoPagoPayment({ amount, onSuccess, onBack }) {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [depositId, setDepositId] = useState(null)

  const handlePay = async () => {
    setLoading(true)
    try {
      const { data: res } = await api.post('/wallet/deposit/mercadopago/create', { amount })
      const d = res?.data ?? res
      setDepositId(d.depositId)
      if (d.initPoint) {
        window.open(d.initPoint, '_blank')
      }
      toast.success('Pago iniciado. Completalo en la ventana de Mercado Pago.')
      setChecking(true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al iniciar pago')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!checking || !depositId) return
    const interval = setInterval(async () => {
      try {
        const { data: res } = await api.get(`/wallet/deposits`)
        const deposits = res?.data ?? res ?? []
        const found = deposits.find(d => d.id === depositId)
        if (found?.status === 'completed') {
          clearInterval(interval)
          toast.success('Pago confirmado. Saldo acreditado!')
          onSuccess()
        }
      } catch (_) {}
    }, 3000)
    return () => clearInterval(interval)
  }, [checking, depositId, onSuccess])

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl text-center space-y-3"
        style={{ background: 'rgba(0, 173, 238, 0.06)', border: '1px solid rgba(0, 173, 238, 0.2)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(0, 173, 238, 0.12)' }}>
          <ExternalLink size={22} style={{ color: '#009EE3' }} />
        </div>
        <p className="font-display font-bold text-lg" style={{ color: 'var(--txt)' }}>
          ${parseFloat(amount).toFixed(2)} USD
        </p>
        <p className="text-xs" style={{ color: 'var(--txt3)' }}>
          Serás redirigido a Mercado Pago para completar el pago
        </p>
      </div>

      {checking ? (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--txt3)' }} />
          <span className="text-sm" style={{ color: 'var(--txt3)' }}>Esperando confirmación del pago...</span>
        </div>
      ) : (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}
          onClick={handlePay} disabled={loading}
          className="w-full py-3 rounded-xl font-display font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#009EE3', color: '#fff' }}>
          {loading ? <><Loader2 size={15} className="animate-spin" /> Iniciando...</>
            : <><ExternalLink size={15} /> Pagar con Mercado Pago</>}
        </motion.button>
      )}

      <button onClick={onBack}
        className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>
        Volver
      </button>
    </div>
  )
}
