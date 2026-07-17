/**
 * Input
 * ─────────────────────────────────────────────────────────────────────────────
 * Reemplaza Input.jsx + FField (RegisterPage) + Field/PasswordField (LoginPage).
 * Todos usan este componente. Cero duplicados.
 *
 * Props:
 *   label           string
 *   hint            string
 *   error           string
 *   icon            LucideIcon  — icono izquierdo
 *   iconRight       LucideIcon  — icono derecho estático
 *   type            string      (default: 'text')
 *   textarea        bool
 *   rows            number      (default: 4)
 *   disabled        bool
 *   readOnly        bool
 *   id              string      — enlaza label con input (accesibilidad)
 *   className       string      — forwarded al input/textarea
 *   containerClassName string
 */

import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    icon: Icon,
    iconRight: IconRight,
    type            = 'text',
    textarea        = false,
    rows            = 4,
    disabled        = false,
    readOnly        = false,
    className       = '',
    containerClassName = '',
    id: externalId,
    value,
    onChange,
    placeholder,
    ...props
  },
  ref,
) {
  const autoId        = useId()
  const id            = externalId ?? autoId
  const hintId        = `${id}-hint`
  const errorId       = `${id}-error`

  const [showPassword, setShowPassword] = useState(false)
  const [focused,      setFocused]      = useState(false)

  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPassword ? 'text' : 'password') : type
  const Tag        = textarea ? 'textarea' : 'input'

  // Estado del borde
  const borderColor = error
    ? 'rgba(239,68,68,0.50)'
    : focused
    ? 'var(--border-hover)'
    : 'var(--border)'

  const boxShadow = error && focused
    ? '0 0 0 3px rgba(239,68,68,0.08)'
    : !error && focused
    ? '0 0 0 12px rgba(16,185,129,0.06), 0 0 0 1px rgba(16,185,129,0.20)'
    : 'none'

  // Padding derecho del input (espacio para iconos)
  const paddingRight = isPassword || IconRight || error ? '40px' : '12px'
  const paddingLeft  = Icon ? '10px' : '12px'

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>

      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-txt-secondary"
        >
          {label}
        </label>
      )}

      {/* Wrapper */}
      <div
        className={`relative flex ${textarea ? 'items-start' : 'items-center'} rounded-xl bg-bg-quad transition-all ${
          focused && !error ? 'bg-em/5 ring-1 ring-em/20' : ''
        }`}
        style={{
          border:   `1px solid ${borderColor}`,
          boxShadow,
          opacity:  disabled ? 0.5 : 1,
        }}
      >
        {/* Icono izquierdo */}
        {Icon && (
          <div
            className="pl-3 flex items-center flex-shrink-0 transition-colors"
            style={{
              color:     focused ? 'var(--em3)' : 'var(--txt3)',
              paddingTop: textarea ? '11px' : 0,
            }}
            aria-hidden="true"
          >
            <Icon size={15} />
          </div>
        )}

        {/* Input / Textarea */}
        <Tag
          ref={ref}
          id={id}
          type={textarea ? undefined : inputType}
          rows={textarea ? rows : undefined}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={`flex-1 bg-transparent border-none outline-none text-txt-primary text-sm font-sans resize-none w-full leading-relaxed ${className}`}
          style={{
            padding:      `9px ${paddingRight} 9px ${paddingLeft}`,
            resize:       textarea ? 'vertical' : 'none',
          }}
          {...props}
        />

        {/* Iconos derechos */}
        {(isPassword || IconRight || error) && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
            aria-hidden={!isPassword}
          >
            {error && (
              <AlertCircle size={14} className="text-status-cancelled flex-shrink-0" aria-hidden="true" />
            )}
            {!error && IconRight && (
              <IconRight size={14} className="text-txt-muted flex-shrink-0" aria-hidden="true" />
            )}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex items-center justify-center text-txt-muted hover:text-txt-secondary transition-colors focus-visible:ring-2 focus-visible:ring-em/40 rounded"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOff size={14} aria-hidden="true" />
                  : <Eye    size={14} aria-hidden="true" />
                }
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error / Hint */}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-status-cancelled">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="text-xs text-txt-muted">
          {hint}
        </p>
      )}
    </div>
  )
})

export default Input
