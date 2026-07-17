import { motion } from 'framer-motion'

/**
 * Card component — consistent container matching the project's design system.
 *
 * Variants:
 *   default  — bg2 background + border2 border
 *   elevated — bg3 background (slightly lifted)
 *   glow     — subtle emerald glow on hover (hover-glow)
 *   glass    — glass morphism
 *   stat     — for metric/stat cards (no padding prop, internal padding only)
 *
 * Props:
 *   variant       'default' | 'elevated' | 'glow' | 'glass'
 *   padding       padding shorthand (default: '20px')
 *   radius        border-radius (default: '12px')
 *   animate       bool — mount fade-in/slide-up (default: true)
 *   delay         number — stagger delay for animate (default: 0)
 *   onClick       fn — makes card clickable
 *   noBorder      bool — remove border
 *   className / style — forwarded
 */

const VARIANTS = {
  default: {
    background: 'var(--bg2)',
    border: '1px solid var(--border2)',
  },
  elevated: {
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
  },
  glow: {
    background: 'var(--bg2)',
    border: '1px solid var(--border2)',
  },
  glass: {
    background: 'var(--glass)',
    border: '1px solid var(--border2)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
  },
}

export default function Card({
  children,
  variant = 'default',
  padding = '20px',
  radius = '12px',
  animate = true,
  delay = 0,
  onClick,
  noBorder = false,
  className = '',
  style = {},
}) {
  const v = VARIANTS[variant] || VARIANTS.default
  const isClickable = !!onClick

  const baseStyle = {
    ...v,
    ...(noBorder ? { border: 'none' } : {}),
    borderRadius: radius,
    padding,
    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
    cursor: isClickable ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  }

  const hoverProps = variant === 'glow'
    ? {
        whileHover: {
          borderColor: 'rgba(16,185,129,0.35)',
          boxShadow: '0 0 24px rgba(16,185,129,0.1)',
        },
      }
    : isClickable
    ? { whileHover: { scale: 1.01 }, whileTap: { scale: 0.99 } }
    : {}

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={baseStyle}
        className={className}
        onClick={onClick}
        {...hoverProps}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      style={baseStyle}
      className={className}
      onClick={onClick}
      {...hoverProps}
    >
      {children}
    </motion.div>
  )
}

/**
 * Card.Header — optional header section with divider
 */
Card.Header = function CardHeader({ children, style = {} }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
      paddingBottom: '14px',
      borderBottom: '1px solid var(--border2)',
      gap: '12px',
      ...style,
    }}>
      {children}
    </div>
  )
}

/**
 * Card.Title — title + optional subtitle
 */
Card.Title = function CardTitle({ children, subtitle }) {
  return (
    <div>
      <h3 style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
        fontSize: '15px',
        color: 'var(--txt)',
        margin: 0,
        letterSpacing: '-0.2px',
      }}>
        {children}
      </h3>
      {subtitle && (
        <p style={{
          fontSize: '12px',
          color: 'var(--txt3)',
          marginTop: '2px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/**
 * Card.Footer
 */
Card.Footer = function CardFooter({ children, style = {} }) {
  return (
    <div style={{
      marginTop: '16px',
      paddingTop: '14px',
      borderTop: '1px solid var(--border2)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      ...style,
    }}>
      {children}
    </div>
  )
}
