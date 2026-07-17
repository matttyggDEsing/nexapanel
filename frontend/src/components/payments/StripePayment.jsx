import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import { CreditCard, Loader2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

function StripeCheckoutForm({ amount, onSuccess, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true); setError(null)
    const { error: submitError } = await elements.submit()
    if (submitError) { setError(submitError.message); setLoading(false); return }
    const { data: res } = await api.post('/wallet/deposit/stripe/create-intent', { amount })
    const { clientSecret } = res?.data ?? res
    const { error: confirmError } = await stripe.confirmPayment({ elements, clientSecret, redirect: 'if_required' })
    if (confirmError) { setError(confirmError.message); setLoading(false); return }
    toast.success('Pago realizado con exito. El saldo se acreditara automaticamente.')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <PaymentElement />
      {error && <div className='flex items-center gap-2 p-3 rounded-xl text-xs' style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.15)' }}><XCircle size={14} /> {error}</div>}
      <div className='flex gap-2'>
        <button type='button' onClick={onBack} className='px-4 py-2.5 rounded-xl text-sm font-medium transition-all' style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>Volver</button>
        <motion.button type='submit' whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} disabled={!stripe || loading} className='flex-1 py-2.5 rounded-xl font-display font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2' style={{ background: 'var(--em)', color: '#000' }}>
          {loading ? <><Loader2 size={15} className='animate-spin' /> Procesando...</> : <><CreditCard size={15} /> Pagar ${parseFloat(amount).toFixed(2)}</>}
        </motion.button>
      </div>
    </form>
  )
}

export default function StripePayment({ amount, onSuccess, onBack }) {
  const [pk, setPk] = useState(null)
  const [loading, setLoading] = useState(true)
  useState(() => {
    const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY
    if (key) { setPk(key); setLoading(false); return }
    api.get('/admin/settings/payment-methods').then(({ data }) => { const m = data?.data ?? data ?? {}; setPk(m?.stripe?.public_key || null) }).catch(() => setPk(null)).finally(() => setLoading(false))
  }, [])
  if (loading) return <div className='flex items-center justify-center py-8'><Loader2 size={20} className='animate-spin' style={{ color: 'var(--txt3)' }} /></div>
  if (!pk) return <div className='p-4 rounded-xl text-center' style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}><p className='text-sm' style={{ color: '#F87171' }}>Stripe no esta configurado.</p></div>
  return <Elements stripe={loadStripe(pk)} options={{ mode: 'payment', currency: 'usd', amount: Math.round(amount * 100) }}><StripeCheckoutForm amount={amount} onSuccess={onSuccess} onBack={onBack} /></Elements>
}