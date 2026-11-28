import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import VersionMenu from './VersionMenu.vue';

import './styles/palette.css';

export default {
  extends: DefaultTheme,
  // The version menu follows the site title in the nav bar, and opens the
  // nav screen on narrow screens. Not nav-bar-title-after: that slot is
  // inside the title's link.
  Layout: () => h(DefaultTheme.Layout, null, {
    'nav-bar-content-before': () => h(VersionMenu),
    'nav-screen-content-before': () => h(VersionMenu, {screen: true}),
  }),
} satisfies Theme;
