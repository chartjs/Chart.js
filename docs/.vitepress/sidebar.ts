import type { DefaultTheme, SiteConfig } from 'vitepress';

type Item = DefaultTheme.SidebarItem;

export const sidebar: DefaultTheme.SidebarMulti = {};

function links(items: Item[]): string[] {
  return items.flatMap(item => [
    ...(item.link ? [item.link] : []),
    ...links(item.items ?? []),
  ]);
}

// '/' -> index.md, '/axes/' -> axes/index.md, '/general/colors' -> general/colors.md
function pageOf(link: string): string {
  const page = link.replace(/^\//, '');
  return page === '' || page.endsWith('/') ? `${page}index.md` : `${page}.md`;
}

// Fails the build for a page that no sidebar lists, so that a page added to
// the docs cannot be left out of the navigation. The API reference has its
// own generated sidebar.
export function checkSidebar({pages, site}: SiteConfig<DefaultTheme.Config>): void {
  const trees = site.themeConfig.sidebar;
  const groups = Array.isArray(trees) ? [trees] : Object.values(trees ?? {}).map(tree => Array.isArray(tree) ? tree : tree.items);
  const listed = new Set(groups.flatMap(items => links(items).map(pageOf)));
  const missing = pages.filter(page => !page.startsWith('api/') && !listed.has(page));
  if (missing.length) {
    throw new Error(`Pages in no sidebar (add them to docs/.vitepress/sidebar.ts):\n  ${missing.join('\n  ')}`);
  }
}
