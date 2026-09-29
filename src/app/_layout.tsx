import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox, Platform, View } from 'react-native';

import "../global.css";

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { TextScaleProvider } from '@/context/TextScaleContext';
import { ThemeModeProvider, useThemeMode } from '@/context/ThemeModeContext';

// Defensive safeguard against injected browser scripts (e.g. crypto wallets/extensions)
// attempting to access `window.ethereum.selectedAddress` before initialization on mobile web.
if (typeof window !== 'undefined') {
  try {
    const win = window as unknown as { ethereum?: Record<string, unknown> };
    if (typeof win.ethereum === 'undefined') {
      win.ethereum = { selectedAddress: undefined };
    }
  } catch {
    // ignore
  }

  if (typeof window.addEventListener === 'function') {
    window.addEventListener('error', (event) => {
      const msg = event?.message || '';
      if (
        msg.includes('ethereum') ||
        msg.includes('selectedAddress') ||
        msg.includes('window.ethereum')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
        return true;
      }
    });
  }
}

LogBox.ignoreLogs([
  'undefined is not an object',
  'selectedAddress',
  'ethereum',
]);

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

function LayoutInner() {
  const { isDark } = useThemeMode();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <TextScaleProvider>
        <View className="h-full w-full flex-1">
          {Platform.OS !== 'web' && <AnimatedSplashOverlay />}
          <AppTabs />
        </View>
      </TextScaleProvider>
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <ThemeModeProvider>
      <LayoutInner />
    </ThemeModeProvider>
  );
}
