import { mkdirSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

// Addresses that served a page on the VuePress site but have no page of
// their own here: [file written into the output, page it leads to]. Both are
// relative to the site base, with '/' separators.
export const redirects: [from: string, to: string][] = [
  ['charts/index.html', 'charts/line.html'],
  ['general/index.html', 'general/data-structures.html'],
  ['samples/index.html', 'samples/information.html'],
  ['getting-started/v3-migration/index.html', 'migration/v3-migration.html'],
  // TypeDoc names the enumeration directory enumerations/, no longer enums/.
  ['api/enums/DecimationAlgorithm.html', 'api/enumerations/DecimationAlgorithm.html'],
  ['api/enums/UpdateModeEnum.html', 'api/enumerations/UpdateModeEnum.html'],
];

function stub(url: string): string {
  // The script runs first so that a #heading survives; the meta refresh is
  // for readers without scripts.
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting</title>
<script>location.replace(${JSON.stringify(url)} + location.hash);</script>
<meta http-equiv="refresh" content="0; url=${url}">
<link rel="canonical" href="${url}">
</head>
<body><a href="${url}">${url}</a></body>
</html>
`;
}

// Writes a stub page for each redirect after the build. GitHub Pages, which
// serves the docs, has no server redirects.
export function writeRedirects({outDir, site}: {outDir: string; site: {base: string}}): void {
  for (const [from, to] of redirects) {
    const file = path.join(outDir, ...from.split('/'));
    mkdirSync(path.dirname(file), {recursive: true});
    writeFileSync(file, stub(site.base + to));
  }
}
