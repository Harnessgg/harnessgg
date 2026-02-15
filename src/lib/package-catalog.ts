import { getNpmVersion, getPypiVersion } from '@/lib/versions';

export type PackageKey = 'electron' | 'kdenlive' | 'browser' | 'blender' | 'gimp';
export type PackageStatus = 'published' | 'coming-soon';
export type PackageEcosystem = 'npm' | 'pypi';

export type PackageMeta = {
  key: PackageKey;
  name: string;
  binary: string;
  route: `/${string}`;
  ecosystem: PackageEcosystem;
  registryName: string;
  install: string;
  status: PackageStatus;
  description: string;
  purpose: string;
  requirements: {
    runtime: string;
    targetApp?: string;
  };
  links: {
    docs: string;
    github: string;
    registry: string;
  };
  llmsCommands: string;
  fallbackVersion: string | null;
};

export const PACKAGE_CATALOG: PackageMeta[] = [
  {
    key: 'electron',
    name: '@harnessgg/electron',
    binary: 'harness-electron',
    route: '/electron',
    ecosystem: 'npm',
    registryName: '@harnessgg/electron',
    install: 'npm install -D @harnessgg/electron',
    status: 'published',
    description:
      'Interact with any Electron app via Chrome DevTools Protocol. Click, type, screenshot, assert. Structured JSON output.',
    purpose: 'Interact with any Electron app via Chrome DevTools Protocol',
    requirements: { runtime: 'Node.js >= 20' },
    links: {
      docs: 'https://harness.gg/electron',
      github: 'https://github.com/harnessgg/electron',
      registry: 'https://www.npmjs.com/package/@harnessgg/electron',
    },
    llmsCommands: 'connect, dom, type, click, wait, screenshot, assert, evaluate, disconnect, sessions, capabilities',
    fallbackVersion: '0.1.0',
  },
  {
    key: 'kdenlive',
    name: 'harnessgg-kdenlive',
    binary: 'harness-kdenlive',
    route: '/kdenlive',
    ecosystem: 'pypi',
    registryName: 'harnessgg-kdenlive',
    install: 'pip install harnessgg-kdenlive',
    status: 'published',
    description:
      'Harness the Kdenlive video editor. Create projects, edit timelines, apply effects, and render. Structured JSON output.',
    purpose: 'Automate Kdenlive video editing timelines, effects, and renders',
    requirements: {
      runtime: 'Python >= 3.10',
      targetApp: 'Kdenlive with bridge running via harness-kdenlive bridge start',
    },
    links: {
      docs: 'https://harness.gg/kdenlive',
      github: 'https://github.com/harnessgg/harness-kdenlive',
      registry: 'https://pypi.org/project/harnessgg-kdenlive/',
    },
    llmsCommands: 'bridge start|stop|status|verify, create-project, import-asset, timeline edits, effects, render-project, render-status',
    fallbackVersion: '0.4.0',
  },
  {
    key: 'blender',
    name: 'harnessgg-blender',
    binary: 'harness-blender',
    route: '/blender',
    ecosystem: 'pypi',
    registryName: 'harnessgg-blender',
    install: 'pip install harnessgg-blender',
    status: 'published',
    description:
      'Harness the Blender 3D suite. Script scenes, objects, materials, and renders from the CLI with structured JSON output.',
    purpose: 'Script Blender scenes, objects, materials, and renders from the CLI',
    requirements: {
      runtime: 'Python >= 3.10',
      targetApp: 'Blender with bridge running via harness-blender bridge start',
    },
    links: {
      docs: 'https://harness.gg/blender',
      github: 'https://github.com/harnessgg/harness-blender',
      registry: 'https://pypi.org/project/harnessgg-blender/',
    },
    llmsCommands: 'bridge start|stop|status|verify, file/object/camera/light/material/modifier commands, render still/animation/status',
    fallbackVersion: '0.2.0',
  },
  {
    key: 'gimp',
    name: 'harnessgg-gimp',
    binary: 'harness-gimp',
    route: '/gimp',
    ecosystem: 'pypi',
    registryName: 'harnessgg-gimp',
    install: 'pip install harnessgg-gimp',
    status: 'published',
    description:
      'Harness GIMP for image editing. Apply filters, adjustments, and exports programmatically with structured JSON output.',
    purpose: 'Automate GIMP image editing with filters, adjustments, layers, and export',
    requirements: {
      runtime: 'Python >= 3.10',
      targetApp: 'GIMP with bridge running via harness-gimp bridge start',
    },
    links: {
      docs: 'https://harness.gg/gimp',
      github: 'https://github.com/harnessgg/harness-gimp',
      registry: 'https://pypi.org/project/harnessgg-gimp/',
    },
    llmsCommands: 'bridge start|stop|status|verify, file/transform/color/filter/layer/selection/text commands',
    fallbackVersion: '0.2.1',
  },
  {
    key: 'browser',
    name: '@harnessgg/browser',
    binary: 'harness-browser',
    route: '/browser',
    ecosystem: 'npm',
    registryName: '@harnessgg/browser',
    install: 'npm install -D @harnessgg/browser',
    status: 'coming-soon',
    description:
      'Harness web browsers for AI agents. Automate tabs, navigation, DOM interaction, and screenshots via a CLI with structured JSON output.',
    purpose: 'Automate web browsers (Chromium, Firefox, WebKit) for AI agents',
    requirements: { runtime: 'Node.js >= 20' },
    links: {
      docs: 'https://harness.gg/browser',
      github: 'https://github.com/harnessgg/harness-browser',
      registry: 'https://www.npmjs.com/package/@harnessgg/browser',
    },
    llmsCommands: 'connect, disconnect, navigate, tabs, dom, query, click, type, wait, screenshot, assert, evaluate',
    fallbackVersion: null,
  },
];

export type ResolvedPackageMeta = PackageMeta & { version: string | null };

export async function resolvePackageCatalog(): Promise<ResolvedPackageMeta[]> {
  const versions = await Promise.all(
    PACKAGE_CATALOG.map(async (pkg) => {
      if (pkg.fallbackVersion === null) return null;
      if (pkg.ecosystem === 'npm') {
        return getNpmVersion(pkg.registryName, pkg.fallbackVersion);
      }
      return getPypiVersion(pkg.registryName, pkg.fallbackVersion);
    }),
  );

  return PACKAGE_CATALOG.map((pkg, index) => ({ ...pkg, version: versions[index] }));
}
