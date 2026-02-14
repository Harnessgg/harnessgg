// Structured JSON package registry for AI agent discovery.
// Agents can fetch https://harness.gg/packages.json to get a full
// machine-readable list of available packages with install instructions,
// command specs, and response schemas.

import type { APIRoute } from 'astro';

const registry = {
  $schema: 'https://harness.gg/schemas/registry.json',
  version: '1.0',
  updated: '2026-02-13',
  description: 'Harness.gg package registry: CLI tools for AI agents',
  homepage: 'https://harness.gg',
  llmsTxt: 'https://harness.gg/llms.txt',
  feedbackEndpoint: {
    url: 'https://harness.gg/api/submit',
    method: 'POST',
    contentType: 'application/json',
    description: 'AI agents can file bug reports and feature requests. Issues land on GitHub.',
    body: {
      type: { type: 'string', enum: ['bug', 'feature', 'question'], required: true },
      package: { type: 'string', description: 'Package name e.g. "electron"', required: true },
      title: { type: 'string', description: 'Short summary', required: true },
      body: { type: 'string', description: 'Full description', required: true },
      context: { type: 'string', description: 'Optional extra context (session, OS, version)', required: false },
    },
    responses: {
      201: { ok: true, issue_url: 'string', number: 'number' },
      '4xx/5xx': { ok: false, error: 'string' },
    },
  },
  packages: [
    {
      name: '@harnessgg/electron',
      version: '0.1.0',
      status: 'published',
      binary: 'harness-electron',
      install: {
        npm: 'npm i -D @harnessgg/electron',
        npx: 'npx @harnessgg/electron --help',
      },
      description:
        'CLI harness for AI agents to interact with Electron apps via Chrome DevTools Protocol. Connect, inspect DOM, click, type, screenshot, assert, and evaluate JavaScript. All with structured JSON output.',
      requirements: {
        node: '>=20',
        targetApp: 'Electron app running with --remote-debugging-port or --inspect-brk',
      },
      links: {
        npm: 'https://www.npmjs.com/package/@harnessgg/electron',
        github: 'https://github.com/harnessgg/electron',
        docs: 'https://github.com/harnessgg/electron/tree/main/docs/llm',
        quickstart: 'https://github.com/harnessgg/electron/blob/main/docs/llm/quickstart.md',
        commandSpec: 'https://github.com/harnessgg/electron/blob/main/docs/llm/command-spec.md',
        errorCodes: 'https://github.com/harnessgg/electron/blob/main/docs/llm/error-codes.md',
        responseSchema: 'https://github.com/harnessgg/electron/blob/main/docs/llm/response-schema.json',
      },
      commands: [
        {
          name: 'connect',
          synopsis: 'harness-electron connect --port <n>',
          description: 'Connect to an Electron app via CDP. Returns a session ID to use in subsequent commands.',
          requiredFlags: ['--port'],
          optionalFlags: ['--host'],
        },
        {
          name: 'dom',
          synopsis: 'harness-electron dom --format <summary|tree|html> --session <id>',
          description: 'Inspect the DOM. Use summary to discover interactive elements, tree for hierarchy, html for raw markup.',
          requiredFlags: ['--session'],
          optionalFlags: ['--format', '--css'],
        },
        {
          name: 'click',
          synopsis: 'harness-electron click [--css|--role|--text|--testid] <selector> --session <id>',
          description: 'Click an element. Use --role + --name for accessible targets.',
          requiredFlags: ['--session'],
          selectorFlags: ['--css', '--xpath', '--text', '--role', '--testid'],
        },
        {
          name: 'type',
          synopsis: 'harness-electron type [--css|--role] <selector> --value <text> --session <id>',
          description: 'Type text into an input element.',
          requiredFlags: ['--session', '--value'],
          selectorFlags: ['--css', '--xpath', '--text', '--role', '--testid'],
        },
        {
          name: 'wait',
          synopsis: 'harness-electron wait --kind <visible|url|text> --expected <value> --session <id>',
          description: 'Wait for a condition. Useful after navigation or async actions.',
          requiredFlags: ['--session', '--kind', '--expected'],
          optionalFlags: ['--timeout'],
        },
        {
          name: 'screenshot',
          synopsis: 'harness-electron screenshot --path <file> --session <id>',
          description: 'Capture a screenshot of the viewport, full page, or specific element.',
          requiredFlags: ['--session', '--path'],
          optionalFlags: ['--full', '--css'],
        },
        {
          name: 'assert',
          synopsis: 'harness-electron assert --kind <url|visible|text|title> --expected <value> --session <id>',
          description: 'Assert a condition. Returns ok:false with ASSERT_FAIL on failure.',
          requiredFlags: ['--session', '--kind', '--expected'],
          optionalFlags: ['--css'],
        },
        {
          name: 'evaluate',
          synopsis: 'harness-electron evaluate --script <js> --session <id>',
          description: 'Execute JavaScript in the page context. Returns the result as JSON.',
          requiredFlags: ['--session', '--script'],
        },
        {
          name: 'disconnect',
          synopsis: 'harness-electron disconnect --session <id>',
          description: 'Close the CDP session.',
          requiredFlags: ['--session'],
        },
        {
          name: 'sessions',
          synopsis: 'harness-electron sessions [list|prune]',
          description: 'List or clean up stored sessions.',
        },
        {
          name: 'capabilities',
          synopsis: 'harness-electron capabilities',
          description: 'Show what the harness can do. Good first command for an agent to run.',
        },
      ],
      responseShape: {
        ok: 'boolean, true on success or false on error',
        protocolVersion: 'string, always "1.0"',
        command: 'string, the command that was run',
        session: 'string, session ID (ses_xxx)',
        data: 'object, command-specific payload on success',
        error: 'object, present on failure: { code, message, retryable, suggestedNext }',
      },
      errorCodes: [
        'INVALID_INPUT',
        'CONNECT_FAILED',
        'TARGET_NOT_FOUND',
        'INVALID_SELECTOR',
        'ACTION_FAILED',
        'TIMEOUT',
        'ASSERT_FAIL',
        'INTERNAL_ERROR',
      ],
      tags: ['electron', 'cdp', 'playwright', 'debugging', 'ui-automation'],
    },
  ],
  comingSoon: [
    {
      name: '@harnessgg/browser',
      description: 'Harness Chromium or Firefox browser tabs.',
      status: 'planned',
    },
    {
      name: '@harnessgg/desktop',
      description: 'Harness native desktop apps on macOS, Windows, and Linux.',
      status: 'planned',
    },
    {
      name: '@harnessgg/terminal',
      description: 'Harness terminal emulators and shell sessions.',
      status: 'planned',
    },
  ],
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(registry, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
