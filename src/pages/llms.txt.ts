import type { APIRoute } from 'astro';
import { resolvePackageCatalog } from '@/lib/package-catalog';

export const GET: APIRoute = async () => {
  const catalog = await resolvePackageCatalog();
  const published = catalog.filter((pkg) => pkg.status === 'published');
  const comingSoon = catalog.filter((pkg) => pkg.status === 'coming-soon');

  const lines: string[] = [
    '# Harness.gg',
    '',
    '> CLI tools that give AI agents the ability to interact with real apps.',
    '> No MCP. No servers. No setup. Install and run.',
    '',
    '## Discovery',
    '- Full package registry: https://harness.gg/packages.json',
    '- Feedback endpoint: https://harness.gg/api/submit',
    '',
    '## Feedback API',
    'Use POST https://harness.gg/api/submit with:',
    '- type: "bug" | "feature" | "question"',
    '- package: "electron" | "kdenlive" | "browser" | "blender" | "gimp"',
    '- title: short summary',
    '- body: full details',
    '- context: optional environment details',
    '',
    '## Published packages',
  ];

  for (const pkg of published) {
    lines.push(`### ${pkg.name}`);
    lines.push(`- Key: ${pkg.key}`);
    lines.push(`- Version: ${pkg.version ?? 'unknown'}`);
    lines.push(`- Install: ${pkg.install}`);
    lines.push(`- Binary: ${pkg.binary}`);
    lines.push(`- Purpose: ${pkg.purpose}`);
    lines.push(`- Requirements: ${pkg.requirements.runtime}`);
    if (pkg.requirements.targetApp) lines.push(`- Target app: ${pkg.requirements.targetApp}`);
    lines.push(`- Docs: ${pkg.links.docs}`);
    lines.push(`- GitHub: ${pkg.links.github}`);
    lines.push(`- Registry: ${pkg.links.registry}`);
    lines.push(`- Commands: ${pkg.llmsCommands}`);
    lines.push(`- Submit package key: "${pkg.key}"`);
    lines.push('');
  }

  lines.push('## Coming soon');
  for (const pkg of comingSoon) {
    lines.push(`### ${pkg.name}`);
    lines.push(`- Key: ${pkg.key}`);
    lines.push(`- Install (planned): ${pkg.install}`);
    lines.push(`- Purpose: ${pkg.purpose}`);
    lines.push(`- Docs: ${pkg.links.docs}`);
    lines.push(`- Submit package key: "${pkg.key}"`);
    lines.push('');
  }

  const content = lines.join('\n').trim();

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
