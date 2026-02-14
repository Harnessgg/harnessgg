export async function getNpmVersion(pkg: string, fallback: string): Promise<string> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return fallback;
    const data = await res.json() as { version?: string };
    return data.version ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getPypiVersion(pkg: string, fallback: string): Promise<string> {
  try {
    const res = await fetch(`https://pypi.org/pypi/${pkg}/json`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return fallback;
    const data = await res.json() as { info?: { version?: string } };
    return data.info?.version ?? fallback;
  } catch {
    return fallback;
  }
}
