export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16, background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 28,
      }}>🔧</div>
      <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color: 'var(--txt)' }}>
        En mantenimiento
      </h1>
      <p style={{ fontSize: 15, color: 'var(--txt2)', maxWidth: 380 }}>
        Estamos realizando mejoras. Volvé en unos minutos.
      </p>
    </div>
  )
}
