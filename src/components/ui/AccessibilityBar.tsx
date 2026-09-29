import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTextScale } from '@/context/TextScaleContext';
import { useThemeMode } from '@/context/ThemeModeContext';
import { AppText } from '@/components/ui/AppText';
import { Palette } from '@/constants/theme';
import { ThemeSwitch } from '@/components/ui/ThemeSwitch';

export const AccessibilityBar: React.FC = () => {
  const { isDark } = useThemeMode();
  const { preset, increase, decrease, setPreset, isMin, isMax, scalePercent } = useTextScale();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1F2329' : '#FFFFFF',
          borderColor: isDark ? '#333A44' : '#E2E8F0',
        },
      ]}>
      {/* Animated Theme Mode Switch */}
      <ThemeSwitch />

      {/* Label and Current Zoom Indicator */}
      <View style={styles.leftGroup}>
        <Ionicons
          name="text-outline"
          size={18}
          color={isDark ? Palette.chartreuse : '#1F5A17'}
        />
        <AppText style={[styles.title, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
          Rozmiar tekstu:
        </AppText>
        <View
          style={[
            styles.percentPill,
            {
              backgroundColor: isDark ? '#2B313A' : '#EDF1EE',
            },
          ]}>
          <AppText
            style={[
              styles.percentText,
              { color: isDark ? Palette.chartreuse : Palette.charcoal },
            ]}>
            {scalePercent}
          </AppText>
        </View>
      </View>

      {/* Preset Buttons & Steppers */}
      <View style={styles.controlsGroup}>
        {/* Młodzież preset */}
        <Pressable
          onPress={() => setPreset('mlodziez')}
          accessibilityLabel="Tryb młodzieżowy, rozmiar 100%"
          style={[
            styles.presetBtn,
            preset === 'mlodziez'
              ? isDark
                ? styles.presetActiveDark
                : styles.presetActiveLight
              : { backgroundColor: isDark ? '#272B33' : '#F1F5F9' },
          ]}>
          <AppText
            style={[
              styles.presetText,
              {
                color:
                  preset === 'mlodziez'
                    ? '#0F172A'
                    : isDark
                    ? '#CBD5E1'
                    : Palette.charcoal,
                fontWeight: preset === 'mlodziez' ? '800' : '600',
              },
            ]}>
            ⚡ Młodzież
          </AppText>
        </Pressable>

        {/* Senior preset */}
        <Pressable
          onPress={() => setPreset('senior')}
          accessibilityLabel="Tryb senior, rozmiar powiększony 118%"
          style={[
            styles.presetBtn,
            preset === 'senior'
              ? isDark
                ? styles.presetActiveDark
                : styles.presetActiveLight
              : { backgroundColor: isDark ? '#272B33' : '#F1F5F9' },
          ]}>
          <AppText
            style={[
              styles.presetText,
              {
                color:
                  preset === 'senior'
                    ? '#0F172A'
                    : isDark
                    ? '#CBD5E1'
                    : Palette.charcoal,
                fontWeight: preset === 'senior' ? '800' : '600',
              },
            ]}>
            👓 Senior
          </AppText>
        </Pressable>

        {/* Stepper Buttons (Min 44x44px touch targets) */}
        <View style={styles.stepperWrap}>
          <Pressable
            onPress={decrease}
            disabled={isMin}
            accessibilityLabel="Zmniejsz tekst"
            style={({ pressed }) => [
              styles.stepBtn,
              {
                backgroundColor: isDark ? '#2B313A' : '#EDF1EE',
                opacity: isMin ? 0.4 : pressed ? 0.7 : 1,
              },
            ]}>
            <AppText style={[styles.stepIcon, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
              A-
            </AppText>
          </Pressable>

          <Pressable
            onPress={increase}
            disabled={isMax}
            accessibilityLabel="Powiększ tekst"
            style={({ pressed }) => [
              styles.stepBtn,
              {
                backgroundColor: isDark ? Palette.chartreuse : Palette.radioactiveGrass,
                opacity: isMax ? 0.4 : pressed ? 0.7 : 1,
              },
            ]}>
            <AppText style={[styles.stepIcon, { color: '#0F172A', fontWeight: '900' }]}>
              A+
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
  },
  percentPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '800',
  },
  controlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetBtn: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetActiveLight: {
    backgroundColor: Palette.chartreuse,
    borderWidth: 1,
    borderColor: Palette.radioactiveGrass,
  },
  presetActiveDark: {
    backgroundColor: Palette.chartreuse,
  },
  presetText: {
    fontSize: 11,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIcon: {
    fontSize: 15,
    fontWeight: '800',
  },
});

export default AccessibilityBar;
