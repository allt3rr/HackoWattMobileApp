import React from 'react';
import { Palette } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppText } from '@/components/ui/AppText';

interface MetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  accentColor?: string;
  topBorderColor?: string;
}

export function MetricTile({
  label,
  value,
  unit,
  subtitle,
  trend,
  trendValue,
  accentColor,
  topBorderColor,
}: MetricTileProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#24272A' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(84, 84, 84, 0.18)',
          ...(topBorderColor
            ? {
                borderTopWidth: 4,
                borderTopColor: topBorderColor,
              }
            : {}),
        },
      ]}>
      <AppText style={[styles.label, { color: isDark ? '#A0AAB3' : Palette.slateGrey }]}>
        {label}
      </AppText>

      <View style={styles.valueRow}>
        <AppText
          style={[
            styles.value,
            { color: accentColor ?? (isDark ? '#EDEDED' : Palette.charcoal) },
          ]}>
          {value != null ? String(value) : ''}
        </AppText>
        {unit ? (
          <AppText style={[styles.unit, { color: isDark ? '#A0AAB3' : Palette.slateGrey }]}>
            {unit}
          </AppText>
        ) : null}
      </View>

      {subtitle || trendValue ? (
        <View style={styles.subRow}>
          {trend ? (
            <AppText
              style={[
                styles.trendIcon,
                {
                  color: trend === 'down' ? Palette.radioactiveGrass : trend === 'up' ? '#EF4444' : Palette.slateGrey,
                },
              ]}>
              {trend === 'down' ? '↓ ' : trend === 'up' ? '↑ ' : '→ '}
            </AppText>
          ) : null}
          <AppText style={[styles.subtitle, { color: isDark ? '#94A3B8' : Palette.slateGrey }]}>
            {trendValue ?? subtitle}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 92,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: 12,
    fontWeight: '700',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  trendIcon: {
    fontSize: 11,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 14,
  },
});