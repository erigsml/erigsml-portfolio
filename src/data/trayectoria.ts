/**
 * Logros, experiencia, formación y habilidades, tomados del CV 2026.
 * Lo más importante va primero en cada lista.
 */

export interface Logro {
  /** Lo que se ganó o se consiguió, en pocas palabras. */
  title: string;
  /** Contexto: con qué proyecto, dónde, para quién. */
  detail: string;
  url?: string;
}

export interface Puesto {
  period: string;
  role: string;
  org: string;
  /** Lo que hice ahí; solo en los puestos que tienen algo que contar. */
  points?: string[];
  stack?: string[];
}

export interface Estudio {
  period: string;
  title: string;
  org: string;
}

export const logros: Logro[] = [
  {
    title: 'Ganador del hackathon ESPOL/FIEC',
    detail: 'Con Brokeate, un robo-advisor donde el agente de IA explica los números sin inventarlos y un asesor humano aprueba cada propuesta.',
    url: 'https://brokeate-web.vercel.app',
  },
  {
    title: 'aLata en Google Play y App Store',
    detail: 'App de carpooling para universitarios verificados de Guayaquil, publicada en Android, iOS y web junto a mi equipo.',
    url: 'https://alata-ec.com',
  },
  {
    title: 'Software en producción para clientes reales',
    detail: 'Consultorios Arrobo factura electrónicamente al SRI; Doxi atiende clientes por web y WhatsApp todos los días.',
  },
];

export const experiencia: Puesto[] = [
  {
    period: 'Ene 2026 – Presente',
    role: 'Desarrollador Full Stack',
    org: 'DOX S.A.',
    points: [
      'Desarrollo y mantengo Doxi, un SaaS de agentes de IA: agente conversacional con tool-use sobre la API de Anthropic para chat web y WhatsApp.',
      'Pagos con Stripe, panel de gestión con bandeja de conversaciones, agenda y tienda, y un widget de chat embebible con texto, voz e imágenes.',
      'APIs REST con Node.js y FastAPI sobre PostgreSQL, MySQL, MariaDB y Supabase.',
      'Automatización de flujos críticos con n8n; despliegue con Docker en AWS.',
    ],
    stack: ['Node.js', 'Express 5', 'PostgreSQL', 'Redis', 'Anthropic API', 'Stripe', 'Docker', 'AWS'],
  },
  {
    period: 'Mar 2022 – 2023',
    role: 'Técnico Electrónico',
    org: 'Pabellón DR, Radiotécnica y Televisión',
    points: ['Mantenimiento y ensamblaje de equipos; instalación y configuración de redes corporativas.'],
  },
  {
    period: 'Ene – Abr 2021',
    role: 'Asistente de Mantenimiento Técnico',
    org: 'Inmobiliaria del Sol S.A. (Mobilsol)',
    points: ['Inventario tecnológico y soporte técnico de primer nivel en redes.'],
  },
];

export const formacion: Estudio[] = [
  { period: '2023 – Presente', title: 'Ingeniería en Software', org: 'Universidad de Guayaquil' },
  {
    period: '2013 – 2023',
    title: 'Bachillerato Técnico en Electrónica de Consumo',
    org: 'U.E.P. Benemérita Sociedad Filantrópica del Guayas',
  },
];

export const idiomas = [
  { name: 'Español', level: 'nativo' },
  { name: 'Inglés', level: 'intermedio (B1)' },
];

export const habilidades: { area: string; items: string[] }[] = [
  {
    area: 'IA y automatización',
    items: ['Anthropic Claude API', 'Agentes con tool-use', 'LangChain / LangGraph', 'RAG con pgvector', 'n8n'],
  },
  {
    area: 'Backend y datos',
    items: ['Node.js', 'Express', 'NestJS', 'FastAPI', 'APIs REST', 'Socket.io', 'PostgreSQL', 'MySQL / MariaDB', 'Redis', 'Supabase'],
  },
  {
    area: 'Frontend y móvil',
    items: ['TypeScript', 'JavaScript', 'React', 'React Native / Expo', 'Vite', 'Tailwind CSS'],
  },
  {
    area: 'Infraestructura',
    items: ['AWS', 'Docker', 'Vercel / Netlify', 'Stripe', 'Git', 'Redes y hardware'],
  },
  {
    area: 'Otros lenguajes',
    items: ['Python', 'Java', 'PHP', 'C / C++ / C#'],
  },
];
