import type { APIRoute } from 'astro';
import { PACKAGE_CATALOG } from '@/lib/package-catalog';

export const GET: APIRoute = () => {
  const publishedCount = PACKAGE_CATALOG.filter((pkg) => pkg.status === 'published').length;

  return new Response(
    JSON.stringify(
      {
        ok: true,
        service: 'harnessgg-site',
        date: new Date().toISOString(),
        packageCount: PACKAGE_CATALOG.length,
        publishedCount,
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
};
