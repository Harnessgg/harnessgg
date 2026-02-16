import type { APIRoute } from 'astro';

type AgentDoc = {
  title: string;
  install: string;
  cliGuidance: string;
  quickFlow: string[];
  response: string;
  errors: { code: string; advice: string }[];
  submit: { endpoint: string; payloadExample: string };
  notes?: string[];
};

const AGENT_DOCS: Record<string, AgentDoc> = {
  electron: {
    title: '@harnessgg/electron agent quick reference',
    install: 'npm install -D @harnessgg/electron',
    cliGuidance:
      'Agents: use CLI commands for interactive exploration and when building something new. Use the Python API for batch operations on known-good workflows.',
    quickFlow: [
      'Start the target app with `electron . --remote-debugging-port=9222` so CDP is open.',
      'Run `harness-electron schema` to publish the available commands.',
      'Pair with `harness-electron connect --port 9222` and keep the implicit session.',
      'Explore `dom --format summary` → `query` to capture stable `elementId`s.',
      'Issue `click`, `type`, `assert`, and `wait` commands using either selectors or `elementId`s.',
      'Wrap up with `screenshot` if needed and `disconnect` to close the session.',
    ],
    response: 'Every command emits one JSON object. Check `ok`; success data lives under `data`, and failures emit `error` with `code`, `message`, `retryable`, and `suggestedNext`.',
    errors: [
      {
        code: 'TARGET_NOT_FOUND',
        advice: 'Run `dom --format summary` again and adjust your selector or switch to `query`-derived element IDs.',
      },
      {
        code: 'INVALID_SELECTOR',
        advice: 'Use `dom --format tree` for structure, then rebuild the selector or rely on a previously stored element ID.',
      },
      { code: 'TIMEOUT', advice: 'Increase `--timeout`, retry the same command, and treat it as transient.' },
    ],
    submit: {
      endpoint: 'https://harness.gg/api/submit',
      payloadExample:
        '{"type":"bug","package":"electron","title":"short summary","body":"Steps to reproduce...","context":"session=default"}',
    },
    notes: ['Use the CLI for discovery; the Python API is better suited for batch pipelines once the flow is stable.'],
  },
  kdenlive: {
    title: 'harnessgg-kdenlive agent quick reference',
    install: 'pip install harnessgg-kdenlive',
    cliGuidance:
      'Agents: use CLI commands for interactive exploration and when building something new. Use the Python API for batch operations on known-good workflows.',
    quickFlow: [
      'Start the bridge via `harnessgg-kdenlive bridge start` (with `bridge status`/`bridge verify` before edits).',
      'Create a project: `create-project edit.kdenlive --title "Agent Edit" --overwrite`.',
      'Import media using `import-asset` and capture `producerId`s for timeline edits.',
      'Build the timeline with `add-text`, `stitch-clips`, `add-track`, and other editing commands.',
      'Validate before rendering, then `render-project edit.kdenlive output.mp4` and poll `render-status JOB_ID`.',
    ],
    response: 'Every command prints a JSON object. Always inspect `ok`; successful payloads appear under `data` and failures under `error` with a `code` hint.',
    errors: [
      {
        code: 'BRIDGE_UNAVAILABLE',
        advice: 'Restart the bridge, wait 0.5s/1s/2s backoff, and only retry up to three times.',
      },
      {
        code: 'VALIDATION_FAILED',
        advice: 'Run `validate` and fix reported issues before issuing renders.',
      },
      { code: 'FILE_NOT_FOUND', advice: 'Double-check paths when referencing media, projects, or snapshots.' },
    ],
    submit: {
      endpoint: 'https://harness.gg/api/submit',
      payloadExample:
        '{"type":"bug","package":"kdenlive","title":"bridge fails","body":"Steps...","context":"bridge=stable"}',
    },
    notes: ['CLI interactions keep you in sync with the bridge; use the Python API only after you lock in the desired workflow.'],
  },
  blender: {
    title: 'harnessgg-blender agent quick reference',
    install: 'pip install harnessgg-blender',
    cliGuidance:
      'Agents: use CLI commands for interactive exploration and when building something new. Use the Python API for batch operations on known-good workflows.',
    quickFlow: [
      'Start `harnessgg-blender bridge start` (port 41749) and verify health with `bridge status/verify`.',
      'Use `file new scene.blend --overwrite` followed by `file inspect` to establish a scene context.',
      'Add geometry/materials with `object add` + `material create/assign`, then light/camera with `camera add` + `light add`.',
      'Render a still frame `render still scene.blend out.png` or animation and watch `render status JOB_ID`.',
    ],
    response: 'Commands emit one JSON response. Inspect `ok`, then use `data` for success fields or `error` for advice.',
    errors: [
      { code: 'NOT_FOUND', advice: 'The object/material does not exist; reconcile names with `object list`. Retry with a valid target.' },
      { code: 'INVALID_INPUT', advice: 'Check flag syntax and required args, then rerun with corrected values.' },
    ],
    submit: {
      endpoint: 'https://harness.gg/api/submit',
      payloadExample:
        '{"type":"bug","package":"blender","title":"light fails","body":"Steps...","context":"bridge=1.2"}',
    },
  },
  gimp: {
    title: 'harnessgg-gimp agent quick reference',
    install: 'pip install harnessgg-gimp',
    cliGuidance:
      'Agents: use CLI commands for interactive exploration and when building something new. Use the Python API for batch operations on known-good workflows.',
    quickFlow: [
      'Bring up the bridge with `harnessgg-gimp bridge start` (check `bridge status`/`bridge verify`).',
      'Open or clone the image you want to edit (`create-project` equivalent) and inspect it.',
      'Resize/crop adjustments with `resize`, `crop`, or `canvas-size`, then correct colours with `brightness-contrast`, `levels`, etc.',
      'Apply filters (blur, sharpen, gaussian-blur) and export the final image with `export <image> <output>`. ',
    ],
    response: 'Every command emits JSON; look at `ok` first. Use `data` for success info and `error.code` for failure reasoning.',
    errors: [
      { code: 'NOT_FOUND', advice: 'Target image or layer missing; verify file paths before retrying.' },
      { code: 'INVALID_INPUT', advice: 'Flags missing or malformed; repeat the command with required flags.' },
    ],
    submit: {
      endpoint: 'https://harness.gg/api/submit',
      payloadExample:
        '{"type":"feature","package":"gimp","title":"new filter","body":"Details...","context":"image=photo.png"}',
    },
  },
};

export const GET: APIRoute = ({ params }) => {
  const pkg = params.pkg as string;
  const doc = AGENT_DOCS[pkg];

  if (!doc) {
    return new Response(
      JSON.stringify(
        {
          error: 'agent doc not found',
          available: Object.keys(AGENT_DOCS),
        },
        null,
        2,
      ),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  }

  return new Response(JSON.stringify(doc, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  });
};

export function getStaticPaths() {
  return Object.keys(AGENT_DOCS).map((pkg) => ({ params: { pkg } }));
}
