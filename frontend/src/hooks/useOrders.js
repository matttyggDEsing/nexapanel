import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { ordersService } from '@/services/ordersService'

/**
 * useOrders — manages order list with pagination, filtering, and actions.
 *
 * @param {object} initialParams — initial query params (page, status, search, perPage)
 *
 * Returns:
 *   orders       — array of orders
 *   stats        — { total, pending, active, completed, cancelled }
 *   loading      — bool
 *   statsLoading — bool
 *   error        — string | null
 *   params       — current query params
 *   setParams    — update params (merges)
 *   refresh      — re-fetch current page
 *   cancelOrder  — fn(id)
 *   refillOrder  — fn(id)
 *   pagination   — { page, total, perPage, totalPages }
 */
export function useOrders(initialParams = {}) {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, total: 0, perPage: 10, totalPages: 1 })
  const [params, setParamsRaw] = useState({ page: 1, perPage: 10, ...initialParams })

  const abortRef = useRef(null)

  const fetchOrders = useCallback(async (currentParams) => {
    // Cancel previous in-flight request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)
    try {
      const { data } = await ordersService.getAll(currentParams)
      setOrders(data.orders ?? data.data ?? [])
      setPagination({
        page: data.page ?? currentParams.page ?? 1,
        total: data.total ?? 0,
        perPage: data.perPage ?? currentParams.perPage ?? 10,
        totalPages: data.totalPages ?? Math.ceil((data.total ?? 0) / (currentParams.perPage ?? 10)),
      })
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setError(err.response?.data?.message || 'Error al cargar las órdenes.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const { data } = await ordersService.getStats()
      setStats(data)
    } catch {
      // Stats are non-critical — fail silently
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Fetch on param change
  useEffect(() => {
    fetchOrders(params)
  }, [params, fetchOrders])

  // Fetch stats once on mount
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const setParams = useCallback((updates) => {
    setParamsRaw(prev => {
      const next = { ...prev, ...updates }
      // Reset to page 1 when filters change (but not on explicit page change)
      if (!('page' in updates)) next.page = 1
      return next
    })
  }, [])

  const refresh = useCallback(() => fetchOrders(params), [params, fetchOrders])

  const cancelOrder = useCallback(async (id) => {
    try {
      await ordersService.cancel(id)
      toast.success('Orden cancelada correctamente.')
      // Optimistic update
      setOrders(prev =>
        prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o)
      )
      fetchStats()
    } catch {
      // Error handled globally in api.js interceptor
    }
  }, [fetchStats])

  const refillOrder = useCallback(async (id) => {
    try {
      await ordersService.refill(id)
      toast.success('Solicitud de recarga enviada.')
    } catch {
      // Handled globally
    }
  }, [])

  return {
    orders,
    stats,
    loading,
    statsLoading,
    error,
    params,
    setParams,
    refresh,
    cancelOrder,
    refillOrder,
    pagination,
  }
}

export default useOrders
