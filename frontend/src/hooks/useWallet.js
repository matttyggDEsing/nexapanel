import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { walletService } from '@/services/walletService'
import { useAuthStore } from '@/store/authStore'

/**
 * useWallet — wallet balance, transaction history, and fund actions.
 *
 * @param {object} options
 *   autoFetch    — fetch on mount (default: true)
 *   txParams     — initial transaction params { page, perPage, type }
 *
 * Returns:
 *   balance         — number
 *   transactions    — array
 *   loading         — bool (transactions)
 *   balanceLoading  — bool
 *   addingFunds     — bool (add-funds in-flight)
 *   error           — string | null
 *   txPagination    — { page, total, perPage, totalPages }
 *   txParams        — current params
 *   setTxParams     — update tx params (resets page)
 *   refresh         — re-fetch balance + transactions
 *   refreshBalance  — re-fetch balance only (lightweight)
 *   addFunds        — fn({ amount, method, ... }) → { success, data }
 *   getInvoice      — fn(transactionId) → invoice data
 */
export function useWallet({ autoFetch = true, txParams: initialTxParams = {} } = {}) {
  const { updateUser } = useAuthStore()

  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(autoFetch)
  const [balanceLoading, setBalanceLoading] = useState(autoFetch)
  const [addingFunds, setAddingFunds] = useState(false)
  const [error, setError] = useState(null)
  const [txPagination, setTxPagination] = useState({
    page: 1, total: 0, perPage: 15, totalPages: 1,
  })
  const [txParams, setTxParamsRaw] = useState({
    page: 1, perPage: 15, ...initialTxParams,
  })

  // ── Fetchers ───────────────────────────────────────────────────────────────

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true)
    try {
      const { data } = await walletService.getBalance()
      const val = data.balance ?? data ?? 0
      setBalance(Number(val))
      // Keep auth store in sync so the sidebar chip stays fresh
      updateUser({ balance: Number(val) })
    } catch {
      // Balance errors are not fatal
    } finally {
      setBalanceLoading(false)
    }
  }, [updateUser])

  const fetchTransactions = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await walletService.getTransactions(params)
      setTransactions(data.transactions ?? data.data ?? [])
      setTxPagination({
        page: data.page ?? params.page ?? 1,
        total: data.total ?? 0,
        perPage: data.perPage ?? params.perPage ?? 15,
        totalPages: data.totalPages ?? Math.ceil((data.total ?? 0) / (params.perPage ?? 15)),
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las transacciones.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (autoFetch) {
      fetchBalance()
    }
  }, [autoFetch, fetchBalance])

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions(txParams)
    }
  }, [autoFetch, txParams, fetchTransactions])

  // ── Param setter ───────────────────────────────────────────────────────────

  const setTxParams = useCallback((updates) => {
    setTxParamsRaw(prev => {
      const next = { ...prev, ...updates }
      if (!('page' in updates)) next.page = 1
      return next
    })
  }, [])

  // ── Actions ────────────────────────────────────────────────────────────────

  const addFunds = useCallback(async (payload) => {
    setAddingFunds(true)
    try {
      const { data } = await walletService.addFunds(payload)
      toast.success('¡Fondos agregados correctamente!')
      // Refresh balance after adding funds
      await fetchBalance()
      await fetchTransactions({ ...txParams, page: 1 })
      return { success: true, data }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Error al agregar fondos.',
      }
    } finally {
      setAddingFunds(false)
    }
  }, [fetchBalance, fetchTransactions, txParams])

  const getInvoice = useCallback(async (id) => {
    try {
      const { data } = await walletService.getInvoice(id)
      return { success: true, data }
    } catch (err) {
      toast.error('No se pudo obtener la factura.')
      return { success: false }
    }
  }, [])

  const refresh = useCallback(() => {
    fetchBalance()
    fetchTransactions(txParams)
  }, [fetchBalance, fetchTransactions, txParams])

  return {
    balance,
    transactions,
    loading,
    balanceLoading,
    addingFunds,
    error,
    txPagination,
    txParams,
    setTxParams,
    refresh,
    refreshBalance: fetchBalance,
    addFunds,
    getInvoice,
  }
}

export default useWallet
