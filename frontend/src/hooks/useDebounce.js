import { useState, useEffect } from 'react'

/**
 * useDebounce — debounces a value by `delay` ms.
 *
 * @param {*}      value  — value to debounce
 * @param {number} delay  — debounce delay in ms (default: 400)
 * @returns debounced value
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchInput, 400)
 *   useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export default useDebounce
