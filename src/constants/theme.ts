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
  creamBackground: '#F7F6ED',
  paper: '#FFFFFF',
  line: 'rgba(84, 84, 84, 0.2)',

  // Semantic status colors
  zoneGreen: '#84DD63',
  zoneYellow: '#EAB308',
  zoneRed: '#EF4444',
  electricAccent: '#CBFF4D',
} as const;

export const Colors = {
  light: {
    text: '#545454',
    textSecondary: '#69747C',
    textMuted: '#8E98A2',
    background: '#F7F6ED',
    card: '#FFFFFF',
    backgroundElement: '#EBE9DE',
    backgroundSelected: '#CBFF4D',
    border: 'rgba(84, 84, 84, 0.2)',
    primary: '#CBFF4D',
    accent: '#84DD63',
    highlight: '#CBFF4D',
    sage: '#6BAA75',
    grass: '#84DD63',
    charcoal: '#545454',
    slate: '#69747C',
  },
  dark: {
    text: '#EDEDED',
    textSecondary: '#9AA4AF',
    textMuted: '#69747C',
    background: '#1A1C1E',
    card: '#24272A',
    backgroundElement: '#2E3236',
    backgroundSelected: '#363C42',
    border: 'rgba(255, 255, 255, 0.12)',
    primary: '#CBFF4D',
    accent: '#84DD63',
    highlight: '#CBFF4D',
    sage: '#6BAA75',
    grass: '#84DD63',
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
