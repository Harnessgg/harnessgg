export const prerender = false;

import type { APIRoute } from 'astro';

const REPO_MAP: Record<string, string> = {
  electron: 'harnessgg/Harness-electron',
  kdenlive: 'harnessgg/Harness-kdenlive',
};

interface SubmitBody {
  type: 'bug' | 'feature' | 'question';
  package: string;
  title: string;
  body: string;
  context?: string;
}

export const POST: APIRoute = async ({ request }) => {
  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) {
    return Response.json({ ok: false, error: 'No GITHUB_TOKEN configured' }, { status: 500 });
  }

  let payload: SubmitBody;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { type, package: pkg, title, body, context } = payload;

  if (!type || !['bug', 'feature', 'question'].includes(type)) {
    return Response.json({ ok: false, error: 'type must be "bug", "feature", or "question"' }, { status: 400 });
  }
  if (!pkg || typeof pkg !== 'string') {
    return Response.json({ ok: false, error: 'package is required' }, { status: 400 });
  }
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return Response.json({ ok: false, error: 'title is required' }, { status: 400 });
  }
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return Response.json({ ok: false, error: 'body is required' }, { status: 400 });
  }

  const repo = REPO_MAP[pkg];
  if (!repo) {
    return Response.json({ ok: false, error: `Unknown package "${pkg}". Valid values: ${Object.keys(REPO_MAP).join(', ')}` }, { status: 400 });
  }
  const labels = ['agent-report', type];

  const issueBody = context
    ? `${body}\n\n---\n**Context:** ${context}`
    : body;

  const ghRes = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ title: title.trim(), body: issueBody, labels }),
  });

  if (!ghRes.ok) {
    const err = await ghRes.text();
    return Response.json({ ok: false, error: `GitHub API error: ${ghRes.status} ${err}` }, { status: 502 });
  }

  const issue = await ghRes.json() as { html_url: string; number: number };
  return Response.json({ ok: true, issue_url: issue.html_url, number: issue.number }, { status: 201 });
};
