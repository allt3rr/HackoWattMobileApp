import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';


export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <ThemedView className="items-center">
      <ThemedText type="code" themeColor="textSecondary" className="text-center">
        v{version}
      </ThemedText>
      <Image
        source={
          scheme === 'dark'
            ? require('@/assets/images/expo-badge-white.png')
            : require('@/assets/images/expo-badge.png')
        }
        className="w-[123px]"
      />
    </ThemedView>
  );
}
