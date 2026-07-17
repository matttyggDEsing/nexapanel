import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, CreditCard, Bitcoin, DollarSign, RefreshCw, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import StripePayment from '@/components/payments/StripePayment'
import PayPalPayment from '@/components/payments/PayPalPayment'
import CryptoPayment from '@/components/payments/CryptoPayment'
import MercadoPagoPayment from '@/components/payments/MercadoPagoPayment'

const PAYMENT_METHODS = [
  { id: 'manual',     label: 'Transferencia Manual',  icon: DollarSign, fee: '0%', min: 1  },
  { id: 'mercadopago', label: 'Mercado Pago',          icon: DollarSign, fee: '0%', min: 5  },
  { id: 'stripe',     label: 'Tarjeta (Stripe)',       icon: CreditCard, fee: '3%', min: 5  },
  { id: 'paypal',     label: 'PayPal',                 icon: DollarSign, fee: '2%', min: 5  },
  { id: 'crypto',     label: 'Criptomonedas (USDT)',   icon: Bitcoin,    fee: '0%', min: 10 },
]

const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 200]

export default function WalletPage() {
  const [amount, setAmount]           = useState('')
  const [method, setMethod]           = useState('manual')
  const [depositing, setDepositing]   = useState(false)
  const [balance, setBalance]         = useState(null)
  const [totalSpent, setTotalSpent]   = useState(0)
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading]     = useState(true)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const [filterType, setFilterType]   = useState('')
  const [payStep, setPayStep]         = useState(false)

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true)
    try {
      const { data } = await api.get('/wallet/balance')
      setBalance(data?.data?.balance ?? data?.balance ?? 0)
    } catch {
      toast.error('Error cargando balance')
    } finally {
      setBalanceLoading(false)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true)
    try {
      const { data } = await api.get('/wallet/transactions', {
        params: { page, perPage: 10, type: filterType || undefined }
      })
      setTransactions(data?.data ?? [])
      if (data?.pagination) {
        setTotalPages(data.pagination.totalPages ?? 1)
      }
    } catch {
      toast.error('Error al cargar historial')
    } finally {
      setTxLoading(false)
    }
  }, [page, filterType])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/orders/stats')
      setTotalSpent(data?.data?.total_spent ?? 0)
    } catch {}
  }, [])

  useEffect(() => {
    fetchBalance()
    fetchStats()
  }, [fetchBalance, fetchStats])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === method)
  const feeRate = parseFloat(selectedMethod?.fee) / 100
  const fee = amount ? (parseFloat(amount) * feeRate).toFixed(2) : '0.00'
  const total = amount ? (parseFloat(amount) + parseFloat(fee)).toFixed(2) : '0.00'

  const handleDeposit = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt < (selectedMethod?.min ?? 1)) {
      return toast.error(`Monto minimo: $${selectedMethod?.min}`)
    }
    if (method === 'manual') {
      setDepositing(true)
      try {
        await api.post('/wallet/deposit', { amount: amt, method })
        toast.success('Solicitud de deposito enviada. Un administrador la procesara en breve.')
        setAmount('')
        fetchBalance()
        fetchTransactions()
      } catch (err) {
        toast.error(err?.response?.data?.message ?? 'Error al procesar el deposito')
      } finally {
        setDepositing(false)
      }
    } else {
      setPayStep(true)
    }
  }

  const handlePaymentSuccess = () => {
    setPayStep(false)
    setAmount('')
    fetchBalance()
    fetchTransactions()
  }

  const handleBack = () => setPayStep(false)

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleString('es-AR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
  }

  if (payStep) {
    const PayComponent = method === 'stripe' ? StripePayment : method === 'paypal' ? PayPalPayment : method === 'crypto' ? CryptoPayment : method === 'mercadopago' ? MercadoPagoPayment : null
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={handleBack} className="p-1.5 rounded-lg transition-all" style={{ background:'var(--bg3)', color:'var(--txt3)' }}><ArrowLeft size={16}/></button>
            <h1 className="font-display font-bold text-xl" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>Pagar con {selectedMethod?.label}</h1>
          </div>
          <p className="text-sm ml-10" style={{ color:'var(--txt2)' }}>Monto: ${parseFloat(amount).toFixed(2)} USD</p>
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="rounded-2xl border p-5" style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          {PayComponent && <PayComponent amount={parseFloat(amount)} onSuccess={handlePaymentSuccess} onBack={handleBack} />}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="font-display font-bold text-2xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-0.5px' }}>
          Wallet
        </h1>
        <p className="text-sm" style={{ color:'var(--txt2)' }}>Gestiona tu saldo y pagos.</p>
      </motion.div>

      {/* Balance card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))', border:'1px solid rgba(16,185,129,0.2)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ background:'radial-gradient(circle, #10B981, transparent)', transform:'translate(30%,-30%)' }} />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-sm mb-2" style={{ color:'var(--em4)' }}>Balance disponible</p>
            {balanceLoading ? (
              <div className="h-12 w-40 rounded-xl animate-pulse mb-1" style={{ background:'rgba(16,185,129,0.15)' }}/>
            ) : (
              <p className="font-display font-bold text-5xl mb-1" style={{ color:'var(--txt)', letterSpacing:'-2px' }}>
                ${(balance ?? 0).toFixed(2)}
              </p>
            )}
            <p className="text-sm" style={{ color:'var(--em3)' }}>USD</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.25)' }}>
              <Wallet size={24} style={{ color:'var(--em3)' }} />
            </div>
            <button onClick={() => { fetchBalance(); fetchTransactions() }}
              className="p-1.5 rounded-lg transition-all"
              style={{ background:'rgba(16,185,129,0.1)', color:'var(--em3)' }}>
              <RefreshCw size={13}/>
            </button>
          </div>
        </div>
        <div className="flex gap-4 mt-6 pt-4" style={{ borderTop:'1px solid rgba(16,185,129,0.15)' }}>
          <div>
            <p className="text-xs mb-1" style={{ color:'var(--em4)' }}>Total gastado</p>
            <p className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>
              ${parseFloat(totalSpent || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add funds */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
          className="rounded-2xl border p-5 space-y-5"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          <div className="flex items-center gap-2">
            <Plus size={16} style={{ color:'var(--em)' }} />
            <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>Agregar Saldo</h2>
          </div>

          <div>
            <label className="block text-xs mb-2 font-medium" style={{ color:'var(--txt3)' }}>MONTO (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-display font-bold"
                style={{ color:'var(--txt3)' }}>$</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" min="1"
                className="w-full pl-7 pr-4 py-3 rounded-xl text-lg font-display font-bold outline-none transition-all"
                style={{ background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--txt)', caretColor:'var(--em)' }}
                onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.35)'}
                onBlur={e => e.target.style.borderColor='var(--border2)'}
              />
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {QUICK_AMOUNTS.map(v => (
                <button key={v} onClick={() => setAmount(String(v))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: amount === String(v) ? 'rgba(16,185,129,0.12)' : 'var(--bg4)',
                    border:`1px solid ${amount === String(v) ? 'rgba(16,185,129,0.25)' : 'transparent'}`,
                    color: amount === String(v) ? 'var(--em3)' : 'var(--txt3)',
                  }}>${v}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs mb-2 font-medium" style={{ color:'var(--txt3)' }}>METODO</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => {
                const Icon = m.icon
                return (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                    style={{
                      background: method === m.id ? 'rgba(16,185,129,0.06)' : 'var(--bg3)',
                      border:`1px solid ${method === m.id ? 'rgba(16,185,129,0.25)' : 'var(--border2)'}`,
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: method === m.id ? 'rgba(16,185,129,0.15)' : 'var(--bg4)' }}>
                      <Icon size={16} style={{ color: method === m.id ? 'var(--em3)' : 'var(--txt3)' }}/>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color:'var(--txt)' }}>{m.label}</p>
                      <p className="text-xs" style={{ color:'var(--txt3)' }}>Min ${m.min} · Fee {m.fee}</p>
                    </div>
                    {method === m.id && (
                      <div className="w-2 h-2 rounded-full" style={{ background:'var(--em)' }}/>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-xl p-3 space-y-1" style={{ background:'var(--bg3)', border:'1px solid var(--border2)' }}>
              <div className="flex justify-between text-xs" style={{ color:'var(--txt3)' }}>
                <span>Monto</span><span>${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color:'var(--txt3)' }}>
                <span>Fee ({selectedMethod?.fee})</span><span>${fee}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-1" style={{ color:'var(--txt)', borderTop:'1px solid var(--border2)' }}>
                <span>Total</span><span>${total}</span>
              </div>
            </div>
          )}

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
            onClick={handleDeposit} disabled={depositing || !amount || parseFloat(amount) <= 0}
            className="w-full py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background:'var(--em)', color:'#000' }}>
            {depositing
              ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/>Procesando...</>
              : <><Plus size={15}/>Continuar al pago</>
            }
          </motion.button>
          <p className="text-xs text-center" style={{ color:'var(--txt3)' }}>
            {method === 'manual' ? 'El deposito sera procesado manualmente por un administrador.' : 'Seras redirigido a la pasarela de pago.'}
          </p>
        </motion.div>

        {/* Transactions */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
          className="rounded-2xl border overflow-hidden"
          style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor:'var(--border2)' }}>
            <h2 className="font-display font-semibold text-base" style={{ color:'var(--txt)' }}>Historial</h2>
            <div className="flex gap-1">
              {[['', 'Todos'], ['credit', 'Creditos'], ['debit', 'Debitos']].map(([val, label]) => (
                <button key={val} onClick={() => { setFilterType(val); setPage(1) }}
                  className="px-2.5 py-1 rounded-lg text-xs transition-all"
                  style={{
                    background: filterType===val ? 'rgba(16,185,129,0.12)' : 'var(--bg3)',
                    color: filterType===val ? 'var(--em3)' : 'var(--txt3)',
                  }}>{label}</button>
              ))}
            </div>
          </div>

          <div className="divide-y" style={{ '--tw-divide-opacity':1, borderColor:'var(--border2)' }}>
            {txLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background:'var(--bg4)' }}/>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded animate-pulse" style={{ background:'var(--bg4)' }}/>
                    <div className="h-2.5 w-1/2 rounded animate-pulse" style={{ background:'var(--bg4)' }}/>
                  </div>
                  <div className="h-4 w-16 rounded animate-pulse" style={{ background:'var(--bg4)' }}/>
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center" style={{ color:'var(--txt3)' }}>
                <p className="text-sm">Sin movimientos aun</p>
              </div>
            ) : (
              <AnimatePresence>
                {transactions.map((tx, i) => (
                  <motion.div key={tx.id}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*.03 }}
                    className="px-5 py-4 flex items-center gap-3"
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: tx.type==='credit' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)' }}>
                      {tx.type==='credit'
                        ? <ArrowDownLeft size={16} style={{ color:'#34D399' }}/>
                        : <ArrowUpRight  size={16} style={{ color:'#FCA5A5' }}/>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color:'var(--txt)' }}>{tx.description}</p>
                      <p className="text-xs" style={{ color:'var(--txt3)' }}>{formatDate(tx.created_at)}</p>
                    </div>
                    <p className="font-display font-semibold text-sm flex-shrink-0"
                      style={{ color: tx.type==='credit' ? '#34D399' : '#FCA5A5' }}>
                      {tx.type==='credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor:'var(--border2)' }}>
              <p className="text-xs" style={{ color:'var(--txt3)' }}>Pagina {page} de {totalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30"
                  style={{ background:'var(--bg3)', color:'var(--txt2)' }}>Ant</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30"
                  style={{ background:'var(--bg3)', color:'var(--txt2)' }}>Sig</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
