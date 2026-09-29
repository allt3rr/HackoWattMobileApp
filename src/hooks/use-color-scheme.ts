import { ColorSchemeName } from 'react-native';
import { useCurrentColorScheme } from '@/context/ThemeModeContext';

/**
 * Color scheme hook for native platforms
 * Synchronized with ThemeModeContext so user can toggle light/dark theme dynamically.
 */
export function useColorScheme(): ColorSchemeName {
  return useCurrentColorScheme();
}
