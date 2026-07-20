module.exports = {
  brand: {
    name: 'NEXA',
    tagline: 'Tecnología que trasciende',
    domain: 'nexa.design',
  },

  colors: {
    bg:  '#060A0E',
    bg2: '#0B1117',
    bg3: '#111820',
    bg4: '#161F2A',
    em:  '#10B981',
    em2: '#059669',
    em3: '#34D399',
    em4: '#6EE7B7',
    txt: '#F0F4F8',
    txt2:'#8A9BB0',
    txt3:'#5E7085',
  },

  fonts: {
    display: 'Syne',
    body: 'DM Sans',
    mono: 'DM Mono',
  },

  posts: [
    // ━━━ LUNES — Tech Authority ━━━
    {
      id: 'tech-authority',
      pillar: 'Tech Authority',
      label: 'TECH AUTHORITY',
      title: ['Arquitectura', 'de software'],
      titleAccent: ['que escala.'],
      subtitle: 'Así construimos sistemas que escalan.',
      code: {
        file: 'src/core/architecture.ts',
        lines: [
          { indent: 0, tokens: [{ t: 'export interface', c: 'em3' }, { t: ' SystemArch {', c: 'txt' }] },
          { indent: 1, tokens: [{ t: 'modules:', c: 'txt' }, { t: ' Module[]', c: 'em4' }, { t: ';', c: 'txt' }] },
          { indent: 1, tokens: [{ t: 'events:', c: 'txt' }, { t: ' EventBus', c: 'em4' }, { t: ';', c: 'txt' }] },
          { indent: 1, tokens: [{ t: 'cache:', c: 'txt' }, { t: ' RedisLayer', c: 'em4' }, { t: ';', c: 'txt' }] },
          { indent: 0, tokens: [{ t: '}', c: 'txt' }] },
          { indent: 0, tokens: [], comment: '// Módulos independientes' },
          { indent: 0, tokens: [], comment: '// Comunicación async vía eventos' },
          { indent: 0, tokens: [{ t: 'export class', c: 'em3' }, { t: ' CoreEngine {', c: 'txt' }] },
          { indent: 1, tokens: [{ t: 'private', c: 'em3' }, { t: ' arch;', c: 'txt' }] },
          { indent: 1, tokens: [{ t: 'async', c: 'em3' }, { t: ' init() {', c: 'txt' }] },
          { indent: 2, tokens: [{ t: 'await', c: 'em3' }, { t: ' ', c: 'txt' }, { t: 'this', c: 'em3' }, { t: '.loadModules();', c: 'txt' }] },
          { indent: 2, tokens: [{ t: 'await', c: 'em3' }, { t: ' ', c: 'txt' }, { t: 'this', c: 'em3' }, { t: '.connectEvents();', c: 'txt' }] },
          { indent: 2, tokens: [{ t: 'await', c: 'em3' }, { t: ' ', c: 'txt' }, { t: 'this', c: 'em3' }, { t: '.warmCache();', c: 'txt' }] },
          { indent: 1, tokens: [{ t: '}', c: 'txt' }] },
          { indent: 1, tokens: [{ t: 'private async', c: 'em3' }, { t: ' loadModules() {', c: 'txt' }] },
          { indent: 2, tokens: [{ t: 'for', c: 'em3' }, { t: ' (', c: 'txt' }, { t: 'const', c: 'em3' }, { t: ' m ', c: 'txt' }, { t: 'of', c: 'em3' }, { t: ' ', c: 'txt' }, { t: 'this', c: 'em3' }, { t: '.arch.modules) {', c: 'txt' }] },
          { indent: 3, tokens: [{ t: 'await', c: 'em3' }, { t: ' m.bootstrap();', c: 'txt' }] },
          { indent: 2, tokens: [{ t: '}', c: 'txt' }] },
          { indent: 1, tokens: [{ t: '}', c: 'txt' }] },
          { indent: 0, tokens: [{ t: '}', c: 'txt' }] },
        ],
        sidebar: {
          label: 'Pilares:',
          items: ['Módulos independientes', 'Event-driven async', 'Cache distribuido', 'Type-safe everywhere', 'Zero-downtime deploys'],
        },
      },
      copy: {
        ig: 'Arquitectura de software que escala. Módulos independientes, comunicación async, cache distribuido. Así construimos sistemas en NEXA.',
        x: 'Así diseñamos la arquitectura de nuestros sistemas. Módulos independientes + event-driven = escalabilidad real.',
        linkedin: 'La arquitectura de software correcta es la diferencia entre un sistema que escala y uno que colapsa. En NEXA diseñamos módulos independientes con comunicación async.',
      },
      hashtags: ['#softwareengineering', '#architecture', '#typescript', '#nodejs'],
    },

    // ━━━ MARTES — Servicios ━━━
    {
      id: 'services',
      pillar: 'Servicios',
      label: 'SERVICIOS',
      title: ['Construimos', 'lo que necesitás.'],
      services: [
        { title: 'Desarrollo Web', desc: 'React, Next.js, Vite. Fullstack moderno.' },
        { title: 'Apps Móviles', desc: 'React Native, Flutter. iOS y Android.' },
        { title: 'Software a Medida', desc: 'ERP, CRM, SaaS. Escalable y robusto.' },
        { title: 'APIs & Backend', desc: 'Node, Go, Python. Microservicios.' },
        { title: 'UI/UX Design', desc: 'Interfaces que se sienten premium.' },
        { title: 'DevOps & Cloud', desc: 'AWS, Docker, CI/CD automatizado.' },
      ],
      stack: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
      carousel: {
        coverTitle: 'Qué hace NEXA',
        coverSubtitle: 'Desarrollo de software a otro nivel.',
        ctaTitle: '¿Tenés un proyecto',
        ctaAccent: 'en mente?',
        ctaButton: 'HABLEMOS',
      },
      copy: {
        ig: 'Construimos lo que necesitás. Web, móvil, software a medida, APIs, UI/UX, DevOps.',
        x: 'Nuestros servicios de desarrollo: React, Next.js, Node, TypeScript, Tailwind, PostgreSQL, Redis, Docker, AWS.',
        linkedin: 'Desarrollo de software profesional. Web, móvil, APIs, SaaS. Soluciones escalables para empresas que quieren crecer.',
      },
      hashtags: ['#desarrolloweb', '#reactjs', '#nextjs', '#softwaredevelopment'],
    },

    // ━━━ MIÉRCOLES — Educación ━━━
    {
      id: 'education',
      pillar: 'Educación',
      label: 'EDUCACIÓN',
      title: ['5 prácticas que todo', 'dev debería seguir'],
      tips: [
        { num: '01', title: 'TypeScript SIEMPRE', desc: 'Tipos fuertes = menos bugs en producción.' },
        { num: '02', title: 'Tests antes de feature', desc: 'TDD no es lento, es inversión en velocidad.' },
        { num: '03', title: 'Modular el código', desc: 'Si un archivo tiene +300 líneas, separalo.' },
        { num: '04', title: 'Code Review obligatorio', desc: 'Un segundo par de ojos previene errores críticos.' },
        { num: '05', title: 'Documentar desde día 1', desc: 'Tu futuro yo te lo va a agradecer.' },
      ],
      copy: {
        ig: '5 prácticas que todo dev debería seguir. TypeScript SIEMPRE, Tests antes de feature, Modular el código...',
        x: '5 prácticas que todo dev debería seguir: TypeScript SIEMPRE / Tests antes de feature / Modular el código / Code Review / Documentar desde día 1',
        linkedin: 'El desarrollo de software profesional se trata de disciplina. Estas 5 prácticas nos ayudan a entregar proyectos consistentemente.',
      },
      hashtags: ['#coding', '#bestpractices', '#typescript', '#tdd'],
    },

    // ━━━ JUEVES — Brand Story ━━━
    {
      id: 'brand-story',
      pillar: 'Brand Story',
      label: 'BRAND STORY',
      headline: ['No somos una', 'agencia más.'],
      headlineAccent: ['Somos ingenieros', 'que construyen.'],
      description: 'NEXA existe para resolver problemas reales con tecnología que funciona. Sin atajos. Sin humo. Solo código que escala.',
      stats: [
        { value: '2', label: 'Fundadores' },
        { value: '30+', label: 'Proyectos' },
        { value: '99.9%', label: 'Uptime' },
        { value: '24/7', label: 'Compromiso' },
      ],
      copy: {
        ig: 'No somos una agencia más. Somos ingenieros que construyen. Sin atajos. Sin humo. Solo código que escala.',
        x: 'No somos una agencia más. Somos ingenieros que construyen. Sin atajos. Sin humo. Solo código que escala.',
        linkedin: 'NEXA nació de la creencia de que el software debe construirse correctamente. No hay atajos. Solo ingeniería.',
      },
      hashtags: ['#founders', '#tech', '#buildinpublic', '#startup'],
    },

    // ━━━ VIERNES — Social Proof ━━━
    {
      id: 'social-proof',
      pillar: 'Social Proof',
      label: 'SOCIAL PROOF',
      title: ['Nuestro', 'trabajo habla.'],
      bigStat: { value: '30+', label: 'proyectos entregados' },
      metrics: [
        { value: '100%', label: 'Proyectos a tiempo' },
        { value: '0', label: 'Proyectos abandonados' },
        { value: '<24h', label: 'Tiempo de respuesta' },
        { value: '5/5', label: 'Satisfacción' },
      ],
      testimonial: {
        quote: '"NEXA entregó exactamente lo que necesitábamos."',
        author: '— Cliente verificado, plataforma SaaS',
        rating: 5,
      },
      copy: {
        ig: 'Nuestro trabajo habla por sí solo. 30+ proyectos, 100% a tiempo, respuesta en menos de 24h, 5/5 satisfacción.',
        x: 'Los números hablan: 30+ proyectos / 100% a tiempo / <24h respuesta / 5/5 satisfacción.',
        linkedin: '30+ proyectos entregados. 100% a tiempo. Satisfacción del cliente: 5/5. En NEXA no prometemos, entregamos.',
      },
      hashtags: ['#portfolio', '#results', '#clients', '#softwarehouse'],
    },
  ],
};
