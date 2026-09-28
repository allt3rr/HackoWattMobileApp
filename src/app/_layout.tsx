import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, useColorScheme, View } from 'react-native';

import "../global.css";

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View className="h-full w-full flex-1">
        {Platform.OS !== 'web' && <AnimatedSplashOverlay />}
        <AppTabs />
      </View>
    </ThemeProvider>
  );
}
