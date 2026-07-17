import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bitcoin, Copy, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'

export default function CryptoPayment({ amount, onSuccess, onBack }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  useState(() => {
    api.get('/admin/settings/payment-methods').then(({ data: res }) => {
      const crypto = (res?.data ?? res ?? {})?.crypto ?? {}
      setData({ address: crypto.address || '0x0000000000000000000000000000000000000000', network: crypto.network || 'USDT TRC20', enabled: crypto.enabled ?? false })
    }).catch(() => setData({ address: '', network: '', enabled: false })).finally(() => setLoading(false))
  }, [])
  const copyAddress = () => { if (!data?.address) return; navigator.clipboard.writeText(data.address); setCopied(true); toast.success('Direccion copiada'); setTimeout(() => setCopied(false), 2000) }
  if (loading) return <div className='flex items-center justify-center py-8'><Loader2 size={20} className='animate-spin' style={{ color: 'var(--txt3)' }} /></div>
  if (!data?.enabled) return <div className='p-4 rounded-xl text-center' style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}><p className='text-sm' style={{ color: '#F87171' }}>Cripto no habilitado.</p></div>
  return (
    <div className='space-y-4'>
      <div className='p-4 rounded-xl text-center space-y-3' style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <div className='w-12 h-12 rounded-xl flex items-center justify-center mx-auto' style={{ background: 'rgba(245,158,11,0.12)' }}><Bitcoin size={22} style={{ color: '#F59E0B' }} /></div>
        <div><p className='font-display font-bold text-lg' style={{ color: 'var(--txt)' }}>{parseFloat(amount).toFixed(2)} USDT</p><p className='text-xs' style={{ color: 'var(--txt3)' }}>Envia exactamente este monto a la direccion de abajo</p></div>
      </div>
      <div><p className='text-xs mb-1.5 font-medium' style={{ color: 'var(--txt3)' }}>RED</p><div className='px-4 py-2.5 rounded-xl text-sm font-medium' style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#F59E0B' }}>{data.network}</div></div>
      <div><p className='text-xs mb-1.5 font-medium' style={{ color: 'var(--txt3)' }}>DIRECCION</p><div className='flex items-center gap-2'><div className='flex-1 px-4 py-2.5 rounded-xl text-xs font-mono truncate' style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--txt)' }}>{data.address}</div><motion.button whileTap={{ scale: .9 }} onClick={copyAddress} className='p-2.5 rounded-xl transition-all flex-shrink-0' style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'var(--bg3)', border: '1px solid var(--border2)', color: copied ? 'var(--em3)' : 'var(--txt3)' }}>{copied ? <Check size={16} /> : <Copy size={16} />}</motion.button></div></div>
      <div className='p-4 rounded-xl space-y-2' style={{ background: 'var(--bg3)', border: '1px solid var(--border2)' }}><p className='text-xs font-medium' style={{ color: 'var(--txt)' }}>Pasos:</p><ol className='text-xs space-y-1' style={{ color: 'var(--txt3)' }}><li>1. Abri tu wallet de cripto</li><li>2. Envia <strong>{parseFloat(amount).toFixed(2)} USDT</strong> en <strong>{data.network}</strong></li><li>3. Copia la direccion de arriba</li><li>4. Pegala como destino de la transferencia</li><li>5. Confirma la transaccion</li><li>6. El saldo se acreditara manualmente al confirmar el pago</li></ol></div>
      <button onClick={onBack} className='w-full py-2.5 rounded-xl text-sm font-medium transition-all' style={{ background: 'var(--bg3)', color: 'var(--txt2)', border: '1px solid var(--border2)' }}>Volver</button>
    </div>
  )
}