import { useState, useEffect, useCallback, useMemo } from 'react'
import { servicesService } from '@/services/servicesService'
import useDebounce from './useDebounce'

/**
 * useServices — fetches and filters the service catalogue.
 *
 * @param {object} options
 *   search       — live search string (debounced internally)
 *   category     — category filter ('' = all)
 *   autoFetch    — bool, fetch on mount (default: true)
 *
 * Returns:
 *   services         — filtered service array
 *   allServices      — unfiltered array
 *   categories       — unique category list
 *   loading          — bool
 *   categoriesLoading — bool
 *   error            — string | null
 *   search           — current search string
 *   setSearch        — update search
 *   category         — current category filter
 *   setCategory      — update category
 *   refresh          — re-fetch from API
 *   getById          — fn(id) → service | undefined
 */
export function useServices({
  search: initialSearch = '',
  category: initialCategory = '',
  autoFetch = true,
} = {}) {
  const [allServices, setAllServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(autoFetch)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)

  const debouncedSearch = useDebounce(search, 350)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await servicesService.getAll()
      setAllServices(data.services ?? data.data ?? data ?? [])
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los servicios.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      const { data } = await servicesService.getCategories()
      setCategories(data.categories ?? data ?? [])
    } catch {
      // Derive from services as fallback
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchServices()
      fetchCategories()
    }
  }, [autoFetch, fetchServices, fetchCategories])

  // Derive categories from services if API endpoint failed / returned empty
  const derivedCategories = useMemo(() => {
    if (categories.length > 0) return categories
    const cats = [...new Set(allServices.map(s => s.category).filter(Boolean))]
    return cats.sort()
  }, [categories, allServices])

  // Client-side filter (API search is also available via servicesService.search)
  const services = useMemo(() => {
    let result = allServices

    if (category) {
      result = result.filter(s => s.category === category)
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      )
    }

    return result
  }, [allServices, category, debouncedSearch])

  const getById = useCallback(
    (id) => allServices.find(s => s.id === id || s.id === Number(id)),
    [allServices]
  )

  const refresh = useCallback(() => {
    fetchServices()
    fetchCategories()
  }, [fetchServices, fetchCategories])

  return {
    services,
    allServices,
    categories: derivedCategories,
    loading,
    categoriesLoading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    refresh,
    getById,
  }
}

export default useServices
