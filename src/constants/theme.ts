/**
 * HackoWatt Design System & Color Tokens
 * Based on the custom brand palette:
 * - Charcoal: #545454
 * - Slate Grey: #69747C
 * - Sage Green: #6BAA75
 * - Radioactive Grass: #84DD63
 * - Chartreuse: #CBFF4D
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  charcoal: '#545454',
  slateGrey: '#69747C',
  sageGreen: '#6BAA75',
  radioactiveGrass: '#84DD63',
  chartreuse: '#CBFF4D',

  // Semantic status colors
  zoneGreen: '#84DD63',
  zoneYellow: '#EAB308',
  zoneRed: '#EF4444',
  electricAccent: '#CBFF4D',
} as const;

export const Colors = {
  light: {
    text: '#1C2024',
    textSecondary: '#69747C',
    textMuted: '#8E98A2',
    background: '#F6F8F6',
    card: '#FFFFFF',
    backgroundElement: '#EDF1EE',
    backgroundSelected: '#E2F3DC',
    border: '#E0E5E2',
    primary: '#6BAA75',
    accent: '#84DD63',
    highlight: '#CBFF4D',
    charcoal: '#545454',
    slate: '#69747C',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#9AA4AF',
    textMuted: '#69747C',
    background: '#16181A',
    card: '#22252A',
    backgroundElement: '#2B3037',
    backgroundSelected: '#333A42',
    border: '#383E46',
    primary: '#84DD63',
    accent: '#CBFF4D',
    highlight: '#CBFF4D',
    charcoal: '#545454',
    slate: '#69747C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 840;
