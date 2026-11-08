import type { ImageMetadata } from 'astro';

import alata from '../assets/projects/alata.jpg';
import consultorioLogo from '../assets/projects/consultorio-logo.png';
import maqmine from '../assets/projects/maqmine.jpg';
import exitone from '../assets/projects/exitone.jpg';
import dox from '../assets/projects/dox.jpg';
import aibots from '../assets/projects/aibots.jpg';
import brokeate from '../assets/projects/brokeate.jpg';
import vozurbana from '../assets/projects/vozurbana.jpg';
import fanzine from '../assets/projects/fanzine.jpg';
import trendmix from '../assets/projects/trendmix.jpg';
import pequemundo from '../assets/projects/pequemundo.jpg';

export interface Project {
  name: string;
  /** Qué es, en dos o tres palabras: "App móvil", "ERP odontológico"… */
  kind: string;
  blurb: string;
  stack: string[];
  image: ImageMetadata;
  alt: string;
  /** Para logos: se muestra completo y centrado sobre este color, en vez de recortado. */
  logoBg?: string;
  url?: string;
  /** Texto del enlace principal; por defecto "Sitio web". */
  urlLabel?: string;
  /** Enlaces a las tiendas de apps, si el proyecto está publicado ahí. */
  stores?: { play?: string; appStore?: string };
  /** Nota corta escrita "a mano" junto al proyecto. Solo en los que tienen algo que contar. */
  note?: string;
  /** Qué hice yo en el proyecto. */
  role?: string;
  /** Hito verificable: premio, publicación, uso en producción. Se muestra como sello. */
  logro?: string;
}

/**
 * Proyectos destacados, del más importante al menos: alcance, usuarios reales
 * y reconocimiento. El primero se muestra más grande.
 */
export const destacados: Project[] = [
  {
    name: 'aLata',
    kind: 'App móvil · Android, iOS y web',
    role: 'Full stack · en equipo',
    blurb:
      'Carpooling universitario en Guayaquil: conecta solo a estudiantes verificados, con rutas a cada campus, chat en tiempo real, reservas y ganancias del conductor.',
    stack: ['React Native', 'Expo', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Redis', 'Socket.io'],
    image: alata,
    alt: 'Pantallas de la app aLata',
    url: 'https://alata-ec.com',
    stores: {
      play: 'https://play.google.com/store/apps/details?id=com.alataec.app',
      appStore: 'https://apps.apple.com/app/id6818165556',
    },
    note: 'nació en una caminata hacia el City Mall',
  },
  {
    name: 'Doxi · AI Bots',
    kind: 'SaaS de agentes de IA',
    role: 'Full stack en DOX S.A.',
    blurb:
      'Agentes que atienden clientes por chat web y WhatsApp: responden dudas, agendan citas y venden con tool-use real sobre Claude. Pagos con Stripe, panel con bandeja, agenda y tienda, y widget embebible con voz e imágenes.',
    stack: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Anthropic API', 'Stripe', 'React', 'AWS'],
    image: aibots,
    alt: 'Panel de Doxi AI Bots',
    url: 'https://ai-bots.us',
    urlLabel: 'ai-bots.us',
  },
  {
    name: 'Consultorios Arrobo',
    kind: 'Sistema de gestión odontológica',
    role: 'Full stack',
    blurb:
      'En producción: citas, historia clínica, facturación electrónica con el SRI, inventario, asistencia biométrica y permisos por rol para una clínica dental.',
    stack: ['Node.js', 'Express', 'PostgreSQL', 'React'],
    image: consultorioLogo,
    alt: 'Logo de Consultorios Arrobo, odontología en su sonrisa',
    logoBg: '#ffffff',
    note: 'factura directo al SRI',
  },
  {
    name: 'Brokeate',
    kind: 'Robo-advisor con agente de IA',
    role: 'Agente de IA',
    logro: '★ Ganador hackathon ESPOL/FIEC',
    blurb:
      'El perfil de riesgo se calcula en la base de datos, un asesor humano aprueba la propuesta y el agente explica los números sin inventarlos.',
    stack: ['LangGraph', 'FastAPI', 'Supabase', 'Gemini', 'GPT', 'Claude'],
    image: brokeate,
    alt: 'Interfaz de Brokeate',
    url: 'https://brokeate-web.vercel.app',
    note: 'la IA explica, no inventa',
  },
];

export interface Group {
  id: string;
  title: string;
  projects: Project[];
}

/** El resto, más breve: sitios y medios digitales hechos para clientes. */
export const otros: Group[] = [
  {
    id: 'clientes',
    title: 'Sitios para clientes',
    projects: [
      {
        name: 'Maqmine',
        kind: 'Catálogo multi-idioma',
        blurb: 'Catálogo data-driven para un fabricante de maquinaria minera en Quito.',
        stack: ['React', 'TypeScript', 'Vite', 'Tailwind'],
        image: maqmine,
        alt: 'Sitio de Maqmine',
        url: 'https://maqmine.com',
      },
      {
        name: 'ExitOne',
        kind: 'Sitio comercial · EE. UU.',
        blurb: 'Insumos de impresión para negocios en Estados Unidos.',
        stack: ['React', 'Vite', 'Tailwind'],
        image: exitone,
        alt: 'Sitio de ExitOne',
        url: 'https://exitone.us',
      },
      {
        name: 'DOX',
        kind: 'Sitio corporativo',
        blurb: 'Impresión y gestión documental en Ecuador.',
        stack: ['React', 'Vite'],
        image: dox,
        alt: 'Sitio de DOX',
        url: 'https://dox-ec.com',
      },
    ],
  },
  {
    id: 'medios',
    title: 'Medios y contenido para clientes',
    projects: [
      {
        name: 'Voz Urbana',
        kind: 'CMS editorial',
        blurb: 'CMS brutalist para un medio digital: se publica subiendo Markdown.',
        stack: ['React', 'Vite', 'Tailwind'],
        image: vozurbana,
        alt: 'Portada de Voz Urbana',
        url: 'https://vozurbana-umber.vercel.app',
      },
      {
        name: 'Fanzine',
        kind: 'Revista digital',
        blurb: 'Revista de cultura pop y notas periodísticas.',
        stack: ['React', 'Vite'],
        image: fanzine,
        alt: 'Portada de Fanzine',
        url: 'https://fanzine-beta.vercel.app',
      },
      {
        name: 'TrendMix',
        kind: 'CMS de entretenimiento',
        blurb: 'Contenido de entretenimiento con fotos y video.',
        stack: ['React', 'Cloudinary'],
        image: trendmix,
        alt: 'Portada de TrendMix',
        url: 'https://trendmix.vercel.app',
      },
      {
        name: 'Pequeño Mundo Digital',
        kind: 'Sitio infantil',
        blurb: 'Cuentos, canciones y juegos para niños.',
        stack: ['React', 'Vite'],
        image: pequemundo,
        alt: 'Portada de Pequeño Mundo Digital',
        url: 'https://pequemundodigital.netlify.app',
      },
    ],
  },
];
