import React, { useEffect, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '@/context/ThemeModeContext';
import { AppText } from '@/components/ui/AppText';
import { Palette } from '@/constants/theme';

const SWITCH_WIDTH = 152;
const SWITCH_HEIGHT = 36;
const PADDING = 3;
const SLIDER_WIDTH = (SWITCH_WIDTH - PADDING * 2) / 2;
const TRAVEL_DISTANCE = SLIDER_WIDTH;

export const ThemeSwitch: React.FC = () => {
  const { isDark, setThemeMode } = useThemeMode();
  const [slideAnim] = useState(() => new Animated.Value(isDark ? 1 : 0));

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isDark ? 1 : 0,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [isDark, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL_DISTANCE],
  });

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: isDark ? '#272B33' : '#EDF1EE',
          borderColor: isDark ? '#3D4450' : '#D1D9D3',
        },
      ]}>
      {/* Animated Sliding Thumb */}
      <Animated.View
        style={[
          styles.slider,
          {
            backgroundColor: isDark ? Palette.chartreuse : Palette.radioactiveGrass,
            transform: [{ translateX }],
          },
        ]}
      />

      {/* Light Option Button */}
      <Pressable
        onPress={() => setThemeMode('light')}
        accessibilityRole="button"
        accessibilityLabel="Włącz tryb jasny"
        style={({ pressed }) => [
          styles.optionBtn,
          pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
        ]}>
        <Ionicons
          name="sunny"
          size={14}
          color={!isDark ? '#0F172A' : '#94A3B8'}
        />
        <AppText
          style={[
            styles.optionText,
            {
              color: !isDark ? '#0F172A' : '#94A3B8',
              fontWeight: !isDark ? '800' : '600',
            },
          ]}>
          Jasny
        </AppText>
      </Pressable>

      {/* Dark Option Button */}
      <Pressable
        onPress={() => setThemeMode('dark')}
        accessibilityRole="button"
        accessibilityLabel="Włącz tryb ciemny"
        style={({ pressed }) => [
          styles.optionBtn,
          pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
        ]}>
        <Ionicons
          name="moon"
          size={13}
          color={isDark ? '#0F172A' : '#64748B'}
        />
        <AppText
          style={[
            styles.optionText,
            {
              color: isDark ? '#0F172A' : '#64748B',
              fontWeight: isDark ? '800' : '600',
            },
          ]}>
          Ciemny
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    borderWidth: 1,
    padding: PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    left: PADDING,
    top: PADDING,
    width: SLIDER_WIDTH,
    height: SWITCH_HEIGHT - PADDING * 2,
    borderRadius: (SWITCH_HEIGHT - PADDING * 2) / 2,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  optionBtn: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    zIndex: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  optionText: {
    fontSize: 12,
  },
});

export default ThemeSwitch;
