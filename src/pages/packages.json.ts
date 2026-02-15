import type { APIRoute } from 'astro';
import { resolvePackageCatalog } from '@/lib/package-catalog';

export const GET: APIRoute = async () => {
  const catalog = await resolvePackageCatalog();
  const published = catalog.filter((pkg) => pkg.status === 'published');
  const comingSoon = catalog.filter((pkg) => pkg.status === 'coming-soon');

  const registry = {
    $schema: 'https://harness.gg/schemas/registry.json',
    version: '1.1',
    updated: new Date().toISOString().slice(0, 10),
    description: 'Harness.gg package registry: CLI tools for AI agents',
    homepage: 'https://harness.gg',
    llmsTxt: 'https://harness.gg/llms.txt',
    feedbackEndpoint: {
      url: 'https://harness.gg/api/submit',
      method: 'POST',
      contentType: 'application/json',
      body: {
        type: { type: 'string', enum: ['bug', 'feature', 'question'], required: true },
        package: {
          type: 'string',
          description: 'Package key: "electron" | "kdenlive" | "browser" | "blender" | "gimp"',
          required: true,
        },
        title: { type: 'string', required: true },
        body: { type: 'string', required: true },
        context: { type: 'string', required: false },
      },
    },
    packages: published.map((pkg) => ({
      key: pkg.key,
      name: pkg.name,
      version: pkg.version,
      status: pkg.status,
      binary: pkg.binary,
      install: pkg.install,
      ecosystem: pkg.ecosystem,
      description: pkg.description,
      purpose: pkg.purpose,
      requirements: pkg.requirements,
      links: pkg.links,
      docsRoute: pkg.route,
    })),
    comingSoon: comingSoon.map((pkg) => ({
      key: pkg.key,
      name: pkg.name,
      status: pkg.status,
      ecosystem: pkg.ecosystem,
      install: pkg.install,
      description: pkg.description,
      links: pkg.links,
      docsRoute: pkg.route,
    })),
  };

  return new Response(JSON.stringify(registry, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
