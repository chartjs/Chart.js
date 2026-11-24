import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import './styles/palette.css';

export default {
  extends: DefaultTheme,
} satisfies Theme;
