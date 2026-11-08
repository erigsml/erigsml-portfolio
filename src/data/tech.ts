/**
 * Logos de tecnologías desde Simple Icons (CC0). AWS, OpenAI y C# ya no están en
 * Simple Icons por pedido de sus marcas: esas se muestran solo con el nombre.
 */
import {
  siReact, siExpo, siTypescript, siJavascript, siNodedotjs, siExpress, siPostgresql, siRedis,
  siSocketdotio, siAnthropic, siClaude, siStripe, siLangchain, siFastapi, siSupabase, siGooglegemini,
  siVite, siTailwindcss, siCloudinary, siNestjs, siN8n, siDocker, siVercel, siNetlify, siGit,
  siPython, siOpenjdk, siPhp, siCplusplus, siMysql,
} from 'simple-icons';

interface Icon { path: string; hex: string }

const map: Record<string, Icon> = {
  'React': siReact,
  'React Native': siReact,
  'React Native / Expo': siReact,
  'Expo': siExpo,
  'TypeScript': siTypescript,
  'JavaScript': siJavascript,
  'Node.js': siNodedotjs,
  'Express': siExpress,
  'Express 5': siExpress,
  'PostgreSQL': siPostgresql,
  'Redis': siRedis,
  'Socket.io': siSocketdotio,
  'Anthropic API': siAnthropic,
  'Anthropic Claude API': siClaude,
  'Claude': siClaude,
  'Stripe': siStripe,
  'LangGraph': siLangchain,
  'LangChain / LangGraph': siLangchain,
  'FastAPI': siFastapi,
  'Supabase': siSupabase,
  'Gemini': siGooglegemini,
  'Vite': siVite,
  'Tailwind': siTailwindcss,
  'Tailwind CSS': siTailwindcss,
  'Cloudinary': siCloudinary,
  'NestJS': siNestjs,
  'n8n': siN8n,
  'Docker': siDocker,
  'Vercel / Netlify': siVercel,
  'Vercel': siVercel,
  'Netlify': siNetlify,
  'Git': siGit,
  'Python': siPython,
  'Java': siOpenjdk,
  'PHP': siPhp,
  'C / C++ / C#': siCplusplus,
  'MySQL / MariaDB': siMysql,
  'MySQL': siMysql,
};

/**
 * Logo y color de marca. Los colores casi negros (Express, Vercel…) usan el color
 * del texto, para que se vean igual de día y de noche.
 */
export function techIcon(name: string): { path: string; color: string } | undefined {
  const icon = map[name];
  if (!icon) return undefined;
  const n = parseInt(icon.hex, 16);
  const luma = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return { path: icon.path, color: luma < 0.3 ? 'currentColor' : `#${icon.hex}` };
}
