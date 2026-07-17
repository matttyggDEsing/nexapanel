import { NexaIcon } from '@/components/ui/NexaIcon'

export default function Footer() {
  return (
    <footer className="relative px-6 py-8 border-t border-border-dim flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <NexaIcon size={22} className="flex-shrink-0" />
        <span className="text-[13px] font-display font-bold text-txt-primary">NexaPanel</span>
      </div>
      <p className="text-[12px] text-txt-muted">© {new Date().getFullYear()} NexaPanel. Todos los derechos reservados.</p>
      <div className="flex gap-5">
        {['Términos', 'Privacidad', 'API'].map((l) => (
          <a key={l} href="#" className="text-[12px] text-txt-muted hover:text-txt-secondary transition-colors">
            {l}
          </a>
        ))}
      </div>
    </footer>
  )
}
