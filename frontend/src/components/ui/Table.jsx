import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Skeleton from './Skeleton'

/**
 * Table component
 *
 * Props:
 *   columns   — Array<{ key, label, sortable?, render?, width?, align? }>
 *   data      — Array<object>
 *   loading   — bool
 *   empty     — ReactNode (shown when data is empty)
 *   rowKey    — string | fn (default: 'id')
 *   onRowClick — fn(row)
 *   pagination — { page, total, perPage, onChange }
 *   stickyHeader — bool
 */
export default function Table({
  columns = [],
  data = [],
  loading = false,
  empty,
  rowKey = 'id',
  onRowClick,
  pagination,
  stickyHeader = false,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = typeof av === 'string'
          ? av.localeCompare(bv, undefined, { numeric: true })
          : av - bv
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  const getKey = (row, i) =>
    typeof rowKey === 'function' ? rowKey(row) : (row[rowKey] ?? i)

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border2)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {/* Head */}
          <thead style={{
            position: stickyHeader ? 'sticky' : 'static',
            top: 0,
            zIndex: 1,
            background: 'var(--bg3)',
          }}>
            <tr>
              {columns.map((col) => {
                const isActive = sortKey === col.key
                return (
                  <th
                    key={col.key}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    style={{
                      padding: '10px 14px',
                      textAlign: col.align || 'left',
                      fontWeight: 600,
                      color: isActive ? 'var(--em3)' : 'var(--txt3)',
                      letterSpacing: '0.04em',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      borderBottom: '1px solid var(--border2)',
                      width: col.width,
                      transition: 'color 0.15s',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {col.label}
                      {col.sortable && (
                        <span style={{ opacity: 0.5 }}>
                          {isActive
                            ? sortDir === 'asc'
                              ? <ChevronUp size={11} style={{ color: 'var(--em3)', opacity: 1 }} />
                              : <ChevronDown size={11} style={{ color: 'var(--em3)', opacity: 1 }} />
                            : <ChevronsUpDown size={11} />
                          }
                        </span>
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '13px 14px', borderBottom: i < 4 ? '1px solid var(--border2)' : 'none' }}>
                      <Skeleton height={13} width={col.align === 'right' ? '40%' : '70%'}
                        style={{ marginLeft: col.align === 'right' ? 'auto' : 0 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: 'var(--txt3)',
                    fontSize: '13px',
                  }}
                >
                  {empty || 'No hay datos para mostrar.'}
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {sorted.map((row, i) => (
                  <motion.tr
                    key={getKey(row, i)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.03 }}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={{
                      borderBottom: i < sorted.length - 1 ? '1px solid var(--border2)' : 'none',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => onRowClick && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          padding: '12px 14px',
                          color: 'var(--txt)',
                          textAlign: col.align || 'left',
                          whiteSpace: 'nowrap',
                          maxWidth: col.maxWidth,
                          overflow: col.maxWidth ? 'hidden' : 'visible',
                          textOverflow: col.maxWidth ? 'ellipsis' : 'clip',
                          verticalAlign: 'middle',
                        }}
                      >
                        {col.render ? col.render(row[col.key], row, i) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && (
        <Pagination {...pagination} />
      )}
    </div>
  )
}

function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: '1px solid var(--border2)',
      gap: '12px',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--txt3)' }}>
        {from}–{to} de {total}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <PageBtn
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          icon={<ChevronLeft size={13} />}
        />

        {/* Page numbers */}
        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          // Sliding window around current page
          let p
          if (totalPages <= 5) {
            p = i + 1
          } else if (page <= 3) {
            p = i + 1
          } else if (page >= totalPages - 2) {
            p = totalPages - 4 + i
          } else {
            p = page - 2 + i
          }
          return (
            <PageBtn
              key={p}
              onClick={() => onChange(p)}
              active={p === page}
              label={p}
            />
          )
        })}

        <PageBtn
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          icon={<ChevronRight size={13} />}
        />
      </div>
    </div>
  )
}

function PageBtn({ onClick, disabled, active, label, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '7px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        fontFamily: "'DM Sans', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: active ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border2)',
        background: active ? 'rgba(16,185,129,0.1)' : 'var(--bg3)',
        color: active ? 'var(--em3)' : disabled ? 'var(--txt3)' : 'var(--txt2)',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s',
      }}
    >
      {icon || label}
    </button>
  )
}
