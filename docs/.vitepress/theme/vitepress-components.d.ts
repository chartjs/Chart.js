// The types of the default theme's internal components that VersionMenu.vue
// uses. tsconfig.json maps their import paths here, because VitePress ships
// them as .vue source that does not type-check outside VitePress.
import type { DefaultTheme } from 'vitepress';
import type { DefineComponent } from 'vue';

declare const component: DefineComponent<{
  // VPNavBarMenuGroup
  item?: DefaultTheme.NavItemWithChildren;
  // VPNavScreenMenuGroup
  text?: string;
  items?: DefaultTheme.NavItemWithChildren['items'];
}>;

export default component;
