import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/theme';

interface AppLogoProps {
  size?: number;
  style?: ViewStyle;
}

const logoSource = require('@/assets/images/logo.webp');

export const AppLogo: React.FC<AppLogoProps> = ({ size = 36, style }) => {
  const [loadFailed, setLoadFailed] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
        },
        style,
      ]}>
      {!loadFailed ? (
        <Image
          source={logoSource}
          style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
          contentFit="cover"
          transition={200}
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <View
          style={[
            styles.fallbackBadge,
            {
              width: size,
              height: size,
              borderRadius: Math.round(size * 0.28),
            },
          ]}>
          <Ionicons name="flash" size={Math.round(size * 0.55)} color="#0F172A" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackBadge: {
    backgroundColor: Palette.radioactiveGrass,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppLogo;
