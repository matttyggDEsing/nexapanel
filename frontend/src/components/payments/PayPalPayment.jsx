import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

export default function PayPalPayment({ amount, onSuccess, onBack }) {
  const [clientId, setClientId] = useState(null)
  const [loading, setLoading] = useState(true)
  useState(() => {
    const key = import.meta.env.VITE_PAYPAL_CLIENT_ID
    if (key) { setClientId(key); setLoading(false); return }
    api.get('/admin/settings/payment-methods').then(({ data }) => { const m = data?.data ?? data ?? {}; setClientId(m?.paypal?.client_id || null) }).catch(() => {}).finally(() => setLoading(false))
  }, [])
  const createOrder = async () => { const { data: res } = await api.post('/wallet/deposit/paypal/create-order', { amount }); return (res?.data ?? res).paypalOrderId }
  const onApprove = async (data) => {
    try { const { data: res } = await api.post('/wallet/deposit/paypal/capture/'+data.orderID); if ((res?.data ?? res).newBalance !== undefined) { toast.success('Deposito completado.'); onSuccess() } }
    catch (err) { toast.error(err?.response?.data?.message || 'Error al capturar el pago') }
  }
  if (loading) return <div className='flex items-center justify-center py-8'><Loader2 size={20} className='animate-spin' style={{ color: 'var(--txt3)' }} /></div>
  if (!clientId) return <div className='p-4 rounded-xl text-center' style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}><p className='text-sm' style={{ color: '#F87171' }}>PayPal no esta configurado.</p></div>
  return (
    <div className='space-y-4'>
      <PayPalScriptProvider options={{ clientId, currency: 'USD', intent: 'capture' }}>
        <PayPalButtons style={{ layout: 'vertical', shape: 'rect', color: 'gold' }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => toast.error('Error de PayPal: ' + (err?.message || 'desconocido'))} />
      </PayPalScriptProvider>
      <button onClick={onBack} className='w-full py-2.5 rounded-xl text-sm font-medium transition-all' style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>Volver</button>
    </div>
  )
}