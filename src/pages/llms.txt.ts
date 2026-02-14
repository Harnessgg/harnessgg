// Machine-readable discovery index for LLMs and AI agents.
// Follows the llms.txt convention: https://llmstxt.org

import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const content = `# Harness.gg

> CLI tools that give AI agents the ability to interact with real apps.
> No MCPs. No servers. No setup. Just npm install and run.

## What is Harness?

Harness is a collection of open-source CLI packages. Each package wraps
a specific app or platform category. You install the package, run the
binary, and get structured JSON back. That's it.

You do not need to configure anything. You do not need to start a server.
You do not need a Model Context Protocol setup. You just need Node.js >= 20
and the target app running.

## Goal

The goal is for AI agents to be able to autonomously discover, install, and
use Harness packages to interact with real running applications — expanding
their capabilities beyond reading and writing code.

## How agents should use this

1. Read this file or /packages.json to discover available packages
2. Pick the package for the app type you need to interact with
3. Run: npm i -D <package-name>
4. Run the binary with --help to see available commands
5. Run commands and parse the JSON output

## Available packages

### @harnessgg/electron
- Install: npm i -D @harnessgg/electron
- Binary: harness-electron
- npm: https://www.npmjs.com/package/@harnessgg/electron
- GitHub: https://github.com/harnessgg/electron
- Purpose: Interact with any Electron app via Chrome DevTools Protocol
- Node: >= 20
- Commands: connect, dom, type, click, wait, screenshot, assert, evaluate, disconnect, sessions, capabilities
- Output: JSON to stdout, always includes ok (boolean), session (string), command (string), data (object)

## Quick start (electron)

\`\`\`sh
# Install
npm i -D @harnessgg/electron

# Connect to an Electron app that has --remote-debugging-port=9222
harness-electron connect --port 9222

# Inspect the DOM
harness-electron dom --format summary --session <session-id>

# Click a button by ARIA role
harness-electron click --role button --name "Sign in" --session <session-id>

# Type into an input
harness-electron type --css "input[type=email]" --value "user@example.com" --session <session-id>

# Take a screenshot
harness-electron screenshot --path ./debug.png --session <session-id>

# Assert a URL
harness-electron assert --kind url --expected "/dashboard" --session <session-id>

# Disconnect
harness-electron disconnect --session <session-id>
\`\`\`

## Response shape

Every command returns a single JSON object:

\`\`\`json
{
  "ok": true,
  "protocolVersion": "1.0",
  "command": "click",
  "session": "ses_abc123",
  "data": { ... }
}
\`\`\`

On error:
\`\`\`json
{
  "ok": false,
  "protocolVersion": "1.0",
  "command": "click",
  "session": "ses_abc123",
  "error": {
    "code": "TARGET_NOT_FOUND",
    "message": "No element matched selector",
    "retryable": true,
    "suggestedNext": ["dom --format summary", "dom --format tree"]
  }
}
\`\`\`

## Error codes

- INVALID_INPUT: Bad arguments. Fix the command.
- CONNECT_FAILED: Could not reach CDP port. Check the app is running with --remote-debugging-port.
- TARGET_NOT_FOUND: Selector matched nothing. Use dom --format summary to discover elements.
- INVALID_SELECTOR: Malformed selector string.
- ACTION_FAILED: The action ran but something went wrong.
- TIMEOUT: The condition did not occur within the timeout.
- ASSERT_FAIL: Assertion did not pass.
- INTERNAL_ERROR: Unexpected error. Retry or report.

## Machine-readable resources

- Full package registry: https://harness.gg/packages.json
- This file: https://harness.gg/llms.txt
- npm org: https://www.npmjs.com/org/harnessgg
- GitHub org: https://github.com/harnessgg

## Coming soon

- @harnessgg/browser — Harness Chromium/Firefox browser tabs
- @harnessgg/desktop — Harness native desktop apps (macOS, Windows, Linux)
- @harnessgg/terminal — Harness terminal emulators and shell sessions
`.trim();

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
