export function NexaIcon({ size = 32, className = '' }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="ni1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
        <linearGradient id="ni2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
      </defs>
      <g transform="translate(100,100)">
        <polygon points="-40,-60 -10,-70 -10,40 -40,50" fill="url(#ni1)"/>
        <polygon points="-40,-60 -10,-70 -40,-30 -70,-20" fill="#34D399" opacity="0.7"/>
        <polygon points="-40,50 -10,40 -40,80 -70,70" fill="#059669" opacity="0.5"/>
        <polygon points="-10,-70 20,-20 20,70 -10,40" fill="#10B981"/>
        <polygon points="20,-20 50,-30 50,60 20,70" fill="url(#ni2)"/>
        <polygon points="20,-20 50,-30 20,10 -10,0" fill="#34D399" opacity="0.7"/>
        <polygon points="20,70 50,60 20,100 -10,90" fill="#059669" opacity="0.5"/>
      </g>
    </svg>
  )
}

export function NexaLogomark({ size = 32, className = '' }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="nl1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
      </defs>
      <g transform="translate(16,16)">
        <polygon points="-10,-15 -2,-17 -2,10 -10,12" fill="url(#nl1)"/>
        <polygon points="-2,-17 6,-7 6,12 -2,10" fill="#10B981"/>
        <polygon points="6,-7 12,-9 12,10 6,12" fill="#059669"/>
      </g>
    </svg>
  )
}
