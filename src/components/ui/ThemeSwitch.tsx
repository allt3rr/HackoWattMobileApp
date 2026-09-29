import React, { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '@/context/ThemeModeContext';
import { AppText } from '@/components/ui/AppText';

const SWITCH_WIDTH = 144;
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
      className="w-auto h-[34px] rounded-full border p-[2px] relative justify-center overflow-hidden bg-[#EDF1EE] border-[#D1D9D3] dark:bg-[#272B33] dark:border-[#3D4450]">
      {/* Animated Sliding Thumb styled with NativeWind */}
      <Animated.View
        pointerEvents="none"
        className="absolute left-[2px] top-[2px] w-[70px] h-[28px] rounded-full shadow-sm bg-[#84DD63] dark:bg-[#CBFF4D] z-10"
        style={{ transform: [{ translateX }] }}
      />

      {/* Button Row with exact equal fixed widths styled with NativeWind */}
      <View className="flex-row w-full h-full items-center z-20">
        {/* Light Option Button */}
        <Pressable
          onPress={() => setThemeMode('light')}
          accessibilityRole="button"
          accessibilityLabel="Włącz tryb jasny"
          className="w-[70px] h-full flex-row items-center justify-center gap-1 active:opacity-70">
          <Ionicons
            name={!isDark ? 'sunny' : 'sunny-outline'}
            size={13}
            color={!isDark ? '#0F172A' : '#94A3B8'}
          />
          <AppText
            allowScaling={false}
            numberOfLines={1}
            className={`text-[11.5px] ${!isDark ? 'font-extrabold text-[#0F172A]' : 'font-semibold text-[#94A3B8]'}`}>
            Jasny
          </AppText>
        </Pressable>

        {/* Dark Option Button */}
        <Pressable
          onPress={() => setThemeMode('dark')}
          accessibilityRole="button"
          accessibilityLabel="Włącz tryb ciemny"
          className="w-[70px] h-full flex-row items-center justify-center gap-1 active:opacity-70">
          <Ionicons
            name={isDark ? 'moon' : 'moon-outline'}
            size={12}
            color={isDark ? '#0F172A' : '#64748B'}
          />
          <AppText
            allowScaling={false}
            numberOfLines={1}
            className={`text-[11.5px] ${isDark ? 'font-extrabold text-[#0F172A]' : 'font-semibold text-[#64748B]'}`}>
            Ciemny
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default ThemeSwitch;
