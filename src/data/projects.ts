import type { ImageMetadata } from 'astro';

import alata from '../assets/projects/alata.jpg';
import consultorioLogo from '../assets/projects/consultorio-logo.png';
import maqmine from '../assets/projects/maqmine.jpg';
import exitone from '../assets/projects/exitone.jpg';
import dox from '../assets/projects/dox.jpg';
import aibots from '../assets/projects/aibots.jpg';
import brokeate from '../assets/projects/brokeate.jpg';
import ugbot from '../assets/projects/ugbot.jpg';
import claudekit from '../assets/projects/claudekit.jpg';
import doximotion from '../assets/projects/doximotion.jpg';
import vozurbana from '../assets/projects/vozurbana.jpg';
import fanzine from '../assets/projects/fanzine.jpg';
import trendmix from '../assets/projects/trendmix.jpg';
import pequemundo from '../assets/projects/pequemundo.jpg';

export interface Project {
  name: string;
  blurb: string;
  stack: string[];
  image: ImageMetadata;
  alt: string;
  /** Para logos: se muestra completo y centrado sobre este color, en vez de recortado. */
  logoBg?: string;
  url?: string;
  /** Enlaces a las tiendas de apps, si el proyecto está publicado ahí. */
  stores?: { play?: string; appStore?: string };
  /** Proyecto principal: ocupa toda una fila con la foto grande. */
  featured?: boolean;
  /** Nota corta escrita "a mano" junto al proyecto. Solo en los que tienen algo que contar. */
  note?: string;
}

export interface Group {
  id: string;
  title: string;
  intro: string;
  projects: Project[];
}

export const groups: Group[] = [
  {
    id: 'produccion',
    title: 'En producción',
    intro: 'Software que la gente usa todos los días.',
    projects: [
      {
        name: 'aLata',
        blurb:
          'Carpooling universitario en Guayaquil: solo estudiantes verificados, rutas a cada campus, chat en tiempo real y reservas. En Android, iOS y web.',
        stack: ['React Native', 'Expo', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Socket.io'],
        image: alata,
        alt: 'Pantallas de la app aLata',
        url: 'https://alata-ec.com',
        stores: {
          play: 'https://play.google.com/store/apps/details?id=com.alataec.app',
          appStore: 'https://apps.apple.com/app/id6818165556',
        },
        featured: true,
        note: 'nació en una caminata hacia el City Mall',
      },
    ],
  },
  {
    id: 'clientes',
    title: 'Clientes reales',
    intro: 'Sistemas para negocios que dependen de ellos: facturación, catálogos, inventario.',
    projects: [
      {
        name: 'Consultorios Arrobo',
        blurb: 'Gestión odontológica: citas, historia clínica, facturación electrónica SRI, inventario y asistencia biométrica.',
        stack: ['Node.js', 'Express', 'PostgreSQL', 'React'],
        image: consultorioLogo,
        alt: 'Logo de Consultorios Arrobo, odontología en su sonrisa',
        logoBg: '#ffffff',
        note: 'factura directo al SRI',
      },
      {
        name: 'Maqmine',
        blurb: 'Catálogo multi-idioma y data-driven para un fabricante de maquinaria minera en Quito.',
        stack: ['React', 'TypeScript', 'Vite', 'Tailwind'],
        image: maqmine,
        alt: 'Sitio de Maqmine',
        url: 'https://maqmine.com',
      },
      {
        name: 'ExitOne',
        blurb: 'Insumos de impresión para negocios en EE. UU.',
        stack: ['React', 'Vite', 'Tailwind'],
        image: exitone,
        alt: 'Sitio de ExitOne',
        url: 'https://exitone.us',
      },
      {
        name: 'DOX',
        blurb: 'Impresión y gestión documental en Ecuador.',
        stack: ['React', 'Vite'],
        image: dox,
        alt: 'Sitio de DOX',
        url: 'https://dox-ec.com',
      },
    ],
  },
  {
    id: 'ia',
    title: 'IA que no inventa',
    intro: 'Agentes con herramientas reales y datos verificables. La IA explica los números; nunca se los inventa.',
    projects: [
      {
        name: 'Doxi · AI Bots',
        blurb: 'Agentes que atienden clientes por web y WhatsApp: responden, agendan y venden con tool-use sobre Claude. Widget embebible con voz e imágenes.',
        stack: ['Express', 'PostgreSQL', 'Redis', 'Anthropic API', 'Stripe'],
        image: aibots,
        alt: 'Panel de Doxi AI Bots',
        url: 'https://ai-bots.us',
      },
      {
        name: 'Brokeate',
        blurb: 'Robo-advisor con humano en el lazo: el riesgo se calcula en la base y el agente lo explica.',
        stack: ['LangGraph', 'FastAPI', 'Supabase'],
        image: brokeate,
        alt: 'Interfaz de Brokeate',
        url: 'https://brokeate-web.vercel.app',
        note: 'ganó el hackathon ESPOL/FIEC',
      },
      {
        name: 'UGBOT',
        blurb: 'RAG con citas verificables a nivel de documento, sección y página de la normativa universitaria.',
        stack: ['NestJS', 'pgvector', 'LLMs'],
        image: ugbot,
        alt: 'Chat de UGBOT',
        note: 'cita hasta la página',
      },
      {
        name: 'claude-kit',
        blurb: 'Mi metodología portable para trabajar con agentes de IA.',
        stack: ['Markdown', 'Claude Code'],
        image: claudekit,
        alt: 'Repositorio claude-kit',
        url: 'https://github.com/erigsml/claude-kit',
      },
    ],
  },
  {
    id: 'cultura',
    title: 'Cultura y experimentos',
    intro: 'Donde se cruzan el código, el arte y las historias.',
    projects: [
      {
        name: 'Doxi Motion',
        blurb: 'Spot de producto de 25 segundos hecho 100 % con código.',
        stack: ['React', 'GSAP'],
        image: doximotion,
        alt: 'Cuadro del spot Doxi Motion',
      },
      {
        name: 'Voz Urbana',
        blurb: 'CMS brutalist para un medio digital: se publica subiendo Markdown.',
        stack: ['React', 'Vite', 'Tailwind'],
        image: vozurbana,
        alt: 'Portada de Voz Urbana',
        url: 'https://vozurbana-umber.vercel.app',
      },
      {
        name: 'Fanzine',
        blurb: 'Revista de cultura pop y notas periodísticas.',
        stack: ['React', 'Vite'],
        image: fanzine,
        alt: 'Portada de Fanzine',
        url: 'https://fanzine-beta.vercel.app',
      },
      {
        name: 'TrendMix',
        blurb: 'CMS de entretenimiento con fotos y video.',
        stack: ['React', 'Cloudinary'],
        image: trendmix,
        alt: 'Portada de TrendMix',
        url: 'https://trendmix.vercel.app',
      },
      {
        name: 'Pequeño Mundo Digital',
        blurb: 'Cuentos, canciones y juegos para niños.',
        stack: ['React', 'Vite'],
        image: pequemundo,
        alt: 'Portada de Pequeño Mundo Digital',
        url: 'https://pequemundodigital.netlify.app',
      },
    ],
  },
];
