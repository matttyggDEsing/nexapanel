import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ArrowRight } from 'lucide-react'
import { fadeUp } from '@/lib/motion'
import { useMagnetic } from '@/hooks/useMagnetic'

export default function FinalCTA() {
  const navigate = useNavigate()
  const cta = useMagnetic(0.25)

  return (
    <section className="relative py-28 px-6 text-center border-t border-border-dim overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-em/10 blur-[100px]"
      />
      <div className="relative mx-auto max-w-lg">
        <motion.div {...fadeUp(0)}>
          <div className="w-14 h-14 rounded-2xl bg-em/10 border border-em/20 grid place-items-center mx-auto mb-6 animate-glow-pulse">
            <Zap size={22} className="text-em-3" />
          </div>
          <h2 className="font-display font-extrabold text-[clamp(24px,4vw,38px)] tracking-tight text-txt-primary mb-3.5">
            ¿Listo para crecer?
          </h2>
          <p className="text-[16px] text-txt-secondary mb-9 leading-relaxed">
            Unite a más de 50,000 creadores y agencias que ya usan NexaPanel para escalar su presencia digital.
          </p>
          <motion.button
            ref={cta.ref}
            onMouseMove={cta.onMouseMove}
            onMouseLeave={cta.onMouseLeave}
            onClick={() => navigate('/register')}
            data-cursor="link"
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[16px] font-bold text-black bg-em shadow-em hover:shadow-em-lg transition-shadow"
          >
            Crear cuenta gratis <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
