import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

/**
 * Button variants:
 *  primary   — filled emerald (default)
 *  secondary — subtle bg3 / border2
 *  ghost     — transparent, hover bg3
 *  danger    — red tint
 *  outline   — emerald border, transparent fill
 *
 * Sizes: sm | md (default) | lg
 */
const VARIANTS = {
  primary: {
    background: 'var(--em)',
    color: '#000',
    border: '1px solid transparent',
    '--hover-bg': 'var(--em2)',
  },
  secondary: {
    background: 'var(--bg3)',
    color: 'var(--txt)',
    border: '1px solid var(--border2)',
    '--hover-bg': 'var(--bg4)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--txt2)',
    border: '1px solid transparent',
    '--hover-bg': 'var(--bg3)',
  },
  danger: {
    background: 'rgba(239,68,68,0.12)',
    color: '#FCA5A5',
    border: '1px solid rgba(239,68,68,0.2)',
    '--hover-bg': 'rgba(239,68,68,0.2)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--em3)',
    border: '1px solid rgba(16,185,129,0.3)',
    '--hover-bg': 'rgba(16,185,129,0.08)',
  },
}

const SIZES = {
  sm:  { padding: '6px 12px', fontSize: '12px', height: '30px', gap: '5px', iconSize: 13 },
  md:  { padding: '8px 16px', fontSize: '14px', height: '38px', gap: '7px', iconSize: 15 },
  lg:  { padding: '10px 22px', fontSize: '15px', height: '44px', gap: '8px', iconSize: 17 },
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    fullWidth = false,
    className = '',
    style = {},
    onClick,
    type = 'button',
    ...props
  },
  ref
) {
  const v = VARIANTS[variant] || VARIANTS.primary
  const s = SIZES[size] || SIZES.md
  const isDisabled = disabled || loading

  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={isDisabled ? {} : { scale: 1.02, backgroundColor: v['--hover-bg'] }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      onClick={isDisabled ? undefined : onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        padding: s.padding,
        height: s.height,
        fontSize: s.fontSize,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        borderRadius: '8px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        flexShrink: 0,
        ...v,
        ...style,
      }}
      className={className}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 size={s.iconSize} className="animate-spin" />
      ) : (
        Icon && <Icon size={s.iconSize} />
      )}
      {children}
      {!loading && IconRight && <IconRight size={s.iconSize} />}
    </motion.button>
  )
})

export default Button
