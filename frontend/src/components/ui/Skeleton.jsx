/**
 * Skeleton — animated shimmer placeholders
 *
 * Usage:
 *   <Skeleton width={200} height={20} />
 *   <Skeleton.Text lines={3} />
 *   <Skeleton.Card />
 *   <Skeleton.Table rows={5} cols={4} />
 *   <Skeleton.Avatar size={40} />
 *   <Skeleton.Badge />
 */

const shimmerStyle = {
  background: 'linear-gradient(90deg, var(--bg3) 25%, var(--bg4) 50%, var(--bg3) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.6s ease-in-out infinite',
  borderRadius: '6px',
  display: 'block',
}

// Base block
function Skeleton({ width, height = 16, radius = 6, style = {}, className = '' }) {
  return (
    <span
      className={className}
      style={{
        ...shimmerStyle,
        width: width || '100%',
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  )
}

// Multi-line text placeholder
Skeleton.Text = function SkeletonText({ lines = 3, lastWidth = '60%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? lastWidth : '100%'}
        />
      ))}
    </div>
  )
}

// Card-shaped placeholder
Skeleton.Card = function SkeletonCard({ height = 120 }) {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border2)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton width={40} height={40} radius={10} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Skeleton height={14} width="50%" />
          <Skeleton height={12} width="30%" />
        </div>
      </div>
      <Skeleton height={height - 80} radius={8} />
    </div>
  )
}

// Stat card placeholder
Skeleton.StatCard = function SkeletonStatCard() {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border2)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Skeleton width={40} height={40} radius={10} />
        <Skeleton width={52} height={24} radius={8} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton width="55%" height={28} radius={6} />
        <Skeleton width="40%" height={13} radius={4} />
      </div>
    </div>
  )
}

// Table rows placeholder
Skeleton.Table = function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border2)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '12px',
          padding: '12px 16px',
          background: 'var(--bg3)',
          borderBottom: '1px solid var(--border2)',
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={12} width="60%" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '12px',
            padding: '14px 16px',
            borderBottom: r < rows - 1 ? '1px solid var(--border2)' : 'none',
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height={14} width={c === 0 ? '80%' : c === cols - 1 ? '40%' : '65%'} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Avatar / icon placeholder
Skeleton.Avatar = function SkeletonAvatar({ size = 40, radius }) {
  return (
    <Skeleton
      width={size}
      height={size}
      radius={radius ?? size / 4}
      style={{ flexShrink: 0 }}
    />
  )
}

// Badge placeholder
Skeleton.Badge = function SkeletonBadge() {
  return <Skeleton width={70} height={22} radius={6} />
}

// Row placeholder (icon + text combo)
Skeleton.Row = function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Skeleton width={36} height={36} radius={8} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton height={13} width="45%" />
        <Skeleton height={11} width="30%" />
      </div>
      <Skeleton width={60} height={13} />
    </div>
  )
}

export default Skeleton
