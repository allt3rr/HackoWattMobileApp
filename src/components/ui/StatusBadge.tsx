import React from 'react';
import { Palette } from '@/constants/theme';
import { ScheduleZone } from '@/types/api';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';

interface StatusBadgeProps {
  zone?: ScheduleZone;
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'neutral';
  label: string;
  size?: 'small' | 'medium';
}

export function StatusBadge({ zone, variant, label, size = 'small' }: StatusBadgeProps) {
  const isDark = useColorScheme() === 'dark';
  const chosenVariant = variant ?? zone ?? 'neutral';

  const getColors = () => {
    switch (chosenVariant) {
      case 'green':
        return {
          bg: isDark ? 'rgba(132, 221, 99, 0.18)' : '#EBF9E6',
          border: Palette.radioactiveGrass,
          text: isDark ? Palette.chartreuse : '#1F5A17',
          dot: Palette.radioactiveGrass,
        };
      case 'yellow':
        return {
          bg: isDark ? 'rgba(234, 179, 8, 0.18)' : '#FEF9C3',
          border: '#FACC15',
          text: isDark ? '#FDE047' : '#854D0E',
          dot: '#EAB308',
        };
      case 'red':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEE2E2',
          border: '#F87171',
          text: isDark ? '#FCA5A5' : '#991B1B',
          dot: '#EF4444',
        };
      case 'blue':
        return {
          bg: isDark ? 'rgba(107, 170, 117, 0.2)' : 'rgba(107, 170, 117, 0.12)',
          border: Palette.sageGreen,
          text: isDark ? '#A7E8B1' : '#2D5634',
          dot: Palette.sageGreen,
        };
      default:
        return {
          bg: isDark ? 'rgba(105, 116, 124, 0.2)' : '#F1F5F9',
          border: isDark ? Palette.charcoal : '#CBD5E1',
          text: isDark ? '#E2E8F0' : Palette.charcoal,
          dot: Palette.slateGrey,
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        size === 'small' ? styles.badgeSmall : styles.badgeMedium,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}>
      <View style={[styles.dot, { backgroundColor: colors.dot }]} />
      <AppText
        style={[
          styles.text,
          size === 'small' ? styles.textSmall : styles.textMedium,
          { color: colors.text },
        ]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    flexShrink: 1,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 12,
  },
});