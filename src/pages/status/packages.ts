import type { APIRoute } from 'astro';
import { resolvePackageCatalog } from '@/lib/package-catalog';

export const GET: APIRoute = async () => {
  const packages = await resolvePackageCatalog();
  const publishedCount = packages.filter((pkg) => pkg.status === 'published').length;

  return new Response(
    JSON.stringify(
      {
        ok: true,
        date: new Date().toISOString(),
        packageCount: packages.length,
        publishedCount,
        packages: packages.map((pkg) => ({
          key: pkg.key,
          name: pkg.name,
          status: pkg.status,
          version: pkg.version,
          install: pkg.install,
          route: pkg.route,
        })),
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    },
  );
};
