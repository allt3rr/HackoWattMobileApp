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

const SWITCH_WIDTH = 144;
const SWITCH_HEIGHT = 34;
const PADDING = 2;
const SLIDER_WIDTH = (SWITCH_WIDTH - PADDING * 2) / 2; // 70px
const TRAVEL_DISTANCE = SLIDER_WIDTH; // 70px

export const ThemeSwitch: React.FC = () => {
  const { isDark, setThemeMode, toggleTheme } = useThemeMode();
  const [slideAnim] = useState(() => new Animated.Value(isDark ? 1 : 0));

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isDark ? 1 : 0,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();
  }, [isDark, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRAVEL_DISTANCE],
  });

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="switch"
      accessibilityLabel={`Przełącz motyw. Aktualny: ${isDark ? 'ciemny' : 'jasny'}`}
      accessibilityState={{ checked: isDark }}
      style={[
        styles.track,
        {
          backgroundColor: isDark ? '#272B33' : '#EDF1EE',
          borderColor: isDark ? '#3D4450' : '#D1D9D3',
        },
      ]}>
      {/* Animated Sliding Thumb - pointerEvents="none" so touches pass directly to buttons */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.slider,
          {
            backgroundColor: isDark ? Palette.chartreuse : Palette.radioactiveGrass,
            transform: [{ translateX }],
          },
        ]}
      />

      {/* Button Row with exact equal fixed widths */}
      <View style={styles.buttonsRow}>
        {/* Light Option Button */}
        <Pressable
          onPress={() => setThemeMode('light')}
          accessibilityRole="button"
          accessibilityLabel="Włącz tryb jasny"
          style={({ pressed }) => [
            styles.optionBtn,
            pressed && { opacity: 0.7 },
          ]}>
          <Ionicons
            name={!isDark ? 'sunny' : 'sunny-outline'}
            size={13}
            color={!isDark ? '#0F172A' : '#94A3B8'}
          />
          <AppText
            allowScaling={false}
            numberOfLines={1}
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
            pressed && { opacity: 0.7 },
          ]}>
          <Ionicons
            name={isDark ? 'moon' : 'moon-outline'}
            size={12}
            color={isDark ? '#0F172A' : '#64748B'}
          />
          <AppText
            allowScaling={false}
            numberOfLines={1}
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
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    borderWidth: 1,
    padding: PADDING,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    left: PADDING,
    top: PADDING,
    width: SLIDER_WIDTH,
    height: SWITCH_HEIGHT - PADDING * 2,
    borderRadius: (SWITCH_HEIGHT - PADDING * 2) / 2,
    zIndex: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  optionBtn: {
    width: SLIDER_WIDTH,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  },
  optionText: {
    fontSize: 11.5,
  },
});

export default ThemeSwitch;
