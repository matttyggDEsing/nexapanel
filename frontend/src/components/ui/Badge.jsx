/**
 * Badge component
 *
 * Variants map to the CSS classes defined in globals.css, plus programmatic extras.
 *
 * Built-in status variants:
 *   pending | active | completed | cancelled | processing
 *
 * Extra semantic variants:
 *   success | error | warning | info | purple | default
 *
 * Props:
 *   variant  — string (default: 'default')
 *   dot      — bool  — shows animated live-dot  (default: false)
 *   icon     — LucideIcon (optional)
 *   size     — 'sm' | 'md' (default: 'md')
 *   pulse    — bool — pulsing ring animation (only meaningful with dot)
 */

import { motion } from 'framer-motion'

const STATUS_LABELS = {
  pending:    'Pendiente',
  active:     'Activa',
  completed:  'Completada',
  cancelled:  'Cancelada',
  processing: 'Procesando',
}

const STYLES = {
  pending:    { background: 'rgba(245,158,11,0.12)',  color: 'var(--status-pending)' },
  active:     { background: 'rgba(16,185,129,0.12)',  color: 'var(--status-active)' },
  completed:  { background: 'rgba(99,102,241,0.12)',  color: 'var(--status-completed)' },
  cancelled:  { background: 'rgba(239,68,68,0.12)',   color: 'var(--status-cancelled)' },
  processing: { background: 'rgba(59,130,246,0.12)',  color: 'var(--status-processing)' },
  success:    { background: 'rgba(16,185,129,0.12)',  color: 'var(--status-success)' },
  error:      { background: 'rgba(239,68,68,0.12)',   color: 'var(--status-error)' },
  warning:    { background: 'rgba(245,158,11,0.12)',  color: 'var(--status-warning)' },
  info:       { background: 'rgba(59,130,246,0.12)',  color: 'var(--status-info)' },
  purple:     { background: 'rgba(139,92,246,0.12)',  color: 'var(--status-purple)' },
  hot:        { background: 'rgba(16,185,129,0.15)',  color: 'var(--status-active)' },
  default:    { background: 'rgba(255,255,255,0.06)', color: 'var(--txt2)' },
}

const DOT_COLORS = {
  active:     'var(--em)',
  processing: '#3B82F6',
  success:    'var(--em)',
  pending:    '#F59E0B',
  warning:    '#F59E0B',
  error:      '#EF4444',
  cancelled:  '#EF4444',
  completed:  '#818CF8',
  default:    'var(--txt2)',
}

const SIZES = {
  sm: { padding: '2px 8px',  fontSize: '11px', gap: '4px', dotSize: '5px' },
  md: { padding: '3px 10px', fontSize: '12px', gap: '5px', dotSize: '6px' },
}

export default function Badge({
  children,
  variant = 'default',
  dot = false,
  pulse = false,
  icon: Icon,
  size = 'md',
  style = {},
}) {
  const s = STYLES[variant] || STYLES.default
  const sz = SIZES[size] || SIZES.md
  const dotColor = DOT_COLORS[variant] || DOT_COLORS.default

  // Auto-label for status variants when no children provided
  const label = children ?? STATUS_LABELS[variant]

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sz.gap,
        padding: sz.padding,
        borderRadius: 'var(--radius-sm)',
        fontSize: sz.fontSize,
        fontWeight: 500,
        letterSpacing: '0.03em',
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
        ...s,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: sz.dotSize,
            height: sz.dotSize,
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
            animation: pulse ? 'pulse-dot 2s infinite' : 'none',
          }}
        />
      )}
      {Icon && <Icon size={11} />}
      {label}
    </motion.span>
  )
}

/**
 * Convenience: render a status badge from an order/service status string
 * Usage: <StatusBadge status="pending" />
 */
export function StatusBadge({ status, size = 'md' }) {
  return <Badge variant={status} dot size={size} />
}
