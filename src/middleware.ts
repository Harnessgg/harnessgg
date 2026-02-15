import type { MiddlewareHandler } from 'astro';
import { PACKAGE_CATALOG } from '@/lib/package-catalog';

function shouldServeLlmText(request: Request, url: URL): boolean {
  const format = (url.searchParams.get('format') ?? '').toLowerCase();
  if (format === 'llm') return true;

  const accept = (request.headers.get('accept') ?? '').toLowerCase();
  const prefersTextOnly =
    (accept.includes('text/plain') || accept.includes('text/markdown')) &&
    !accept.includes('text/html');
  if (prefersTextOnly) return true;

  const ua = (request.headers.get('user-agent') ?? '').toLowerCase();
  const llmHints = ['chatgpt', 'gptbot', 'anthropic', 'claude', 'perplexity', 'cohere', 'openai'];
  const isLikelyLlm = llmHints.some((hint) => ua.includes(hint));
  const acceptIsWildcard = accept.trim() === '*/*' || accept === '';
  return isLikelyLlm && (acceptIsWildcard || accept.includes('text/plain') || accept.includes('text/markdown'));
}

function toLlmDoc(pathname: string): string | null {
  const pkg = PACKAGE_CATALOG.find((entry) => entry.route === pathname);
  if (!pkg) return null;

  return [
    `# ${pkg.name}`,
    '',
    `Route: https://harness.gg${pkg.route}`,
    `Status: ${pkg.status}`,
    '',
    'Issue filing',
    `curl -X POST https://harness.gg/api/submit (use JSON with "package":"${pkg.key}" and "type":"bug"|"feature"|"question")`,
    '',
    `Install: ${pkg.install}`,
    `Binary: ${pkg.binary}`,
    `Purpose: ${pkg.purpose}`,
    `Requirements: ${pkg.requirements.runtime}`,
    ...(pkg.requirements.targetApp ? [`Target app: ${pkg.requirements.targetApp}`] : []),
    '',
    'Links',
    `- Docs: ${pkg.links.docs}`,
    `- GitHub: ${pkg.links.github}`,
    `- Registry: ${pkg.links.registry}`,
    '',
    'Command families',
    `- ${pkg.llmsCommands}`,
    '',
    'Discovery',
    '- https://harness.gg/llms.txt',
    '- https://harness.gg/packages.json',
  ].join('\n');
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const doc = toLlmDoc(pathname);
  if (!doc) return next();
  if (!shouldServeLlmText(context.request, url)) return next();

  return new Response(doc, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      Vary: 'Accept, User-Agent',
    },
  });
};
