// Node runs this file without a compiler (`pnpm --filter chartjs-docs-vitepress
// test`), by stripping the types: keep it to erasable TypeScript, so no enums,
// no namespaces, no parameter properties, and `import type` for types.
import type { DefaultTheme } from 'vitepress';

export interface Version {
  name: string;
  tag: string | null;
  parts: [number, number, number];
  prerelease: string[];
}

export interface VersionMenu {
  title: string;
  documentation: DefaultTheme.NavItemWithLink[];
  releaseNotes: DefaultTheme.NavItemWithLink[];
}

// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-.]+)?$/;

// Absolute, because the VitePress link helpers would put a path such as
// /docs/4.5.1/ under this site's base, and because the other versions are
// only published on chartjs.org, not in a preview or a local build.
const DOCS = 'https://www.chartjs.org/docs';
const RELEASES = 'https://github.com/chartjs/Chart.js/releases/tag';

function parse(name: string, tag: string | null): Version | null {
  const matches = SEMVER.exec(name);
  if (!matches) {
    return null;
  }
  return {
    name,
    tag,
    parts: [Number(matches[1]), Number(matches[2]), Number(matches[3])],
    prerelease: matches[4] ? matches[4].split('.') : [],
  };
}

function compareIdentifiers(a: string, b: string): number {
  const numeric = /^\d+$/;
  if (numeric.test(a) && numeric.test(b)) {
    return Number(a) - Number(b);
  }
  if (numeric.test(a) !== numeric.test(b)) {
    return numeric.test(a) ? -1 : 1;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Semver precedence: negative when `a` is older than `b`. */
function compare(a: Version, b: Version): number {
  for (let i = 0; i < 3; i++) {
    if (a.parts[i] !== b.parts[i]) {
      return a.parts[i] - b.parts[i];
    }
  }
  // A release is newer than its prereleases.
  if (!a.prerelease.length || !b.prerelease.length) {
    return b.prerelease.length - a.prerelease.length;
  }
  for (let i = 0; i < Math.min(a.prerelease.length, b.prerelease.length); i++) {
    const result = compareIdentifiers(a.prerelease[i], b.prerelease[i]);
    if (result) {
      return result;
    }
  }
  return a.prerelease.length - b.prerelease.length;
}

/** Keeps the newest version of each minor (depth 2) or patch (depth 3). */
function collapse(versions: Version[], depth: 2 | 3): Version[] {
  const seen = new Set<string>();
  return versions.filter((version) => {
    const key = version.parts.slice(0, depth).join('.');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/** Reads a jsDelivr package listing; newest first. */
export function parseVersions(json: {versions: string[]; tags?: Record<string, string>}): Version[] {
  const tags = Object.entries(json.tags || {});
  return json.versions
    .map((name) => parse(name, tags.find(([, v]) => v === name)?.[0] ?? null))
    .filter((version): version is Version => version !== null)
    .sort((a, b) => compare(b, a));
}

/**
 * The npm registry does not allow CORS requests, so the published versions
 * come from jsDelivr, as they did for @simonbrunel/vuepress-plugin-versions.
 */
export async function fetchVersions(): Promise<Version[]> {
  const url = 'https://data.jsdelivr.com/v1/package/npm/chart.js';
  const response = await fetch(url, {signal: AbortSignal.timeout(10000)});
  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`);
  }
  return parseVersions(await response.json());
}

/**
 * `version` is the tag the docs are published under (master, latest, next or
 * x.y.z) and `number` the release they were built from, both from
 * docs-version.json. The tags in `versions` say what npm calls current; the
 * list built into the site has none, so it is judged again in the browser.
 */
function menuTitle(version: string, number: string | undefined, versions: Version[]): string {
  if (version === 'master') {
    return 'Development (master)';
  }
  const name = number ?? version;
  const tag = versions.find((v) => v.name === name)?.tag ?? null;
  const known = versions.some((v) => v.tag !== null);
  // Until the list is refreshed, a build published as latest is taken at its word.
  if (tag === 'latest' || (version === 'latest' && !known)) {
    return `Latest (${name})`;
  }
  if (tag !== null && tag === version) {
    return `${name} (${tag})`;
  }
  return `${name} (outdated)`;
}

/** The menu's title and two groups of links. */
export function versionMenu({version, number, versions}: {
  version: string;
  number?: string;
  versions: Version[];
}): VersionMenu {
  const docs = (text: string, path: string): DefaultTheme.NavItemWithLink =>
    ({text, link: `${DOCS}/${path}/`, target: '_self', noIcon: true});

  // A prerelease is published under /docs/next/, never under its own number.
  const releases = versions.filter(({parts: [major, minor], prerelease}) =>
    !prerelease.length && (major > 2 || (major === 2 && minor >= 6)));

  return {
    title: menuTitle(version, number, versions),
    documentation: [
      docs('Development (master)', 'master'),
      docs('Latest version', 'latest'),
      ...collapse(releases, 2).map((v) => docs(v.name + (v.tag ? ` (${v.tag})` : ''), v.name)),
    ],
    releaseNotes: collapse(versions, 3).slice(0, 5).map((v) => ({
      text: v.name,
      link: `${RELEASES}/v${v.name}`,
      target: '_blank',
    })),
  };
}
