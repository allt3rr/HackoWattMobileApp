import { Palette } from '@/constants/theme';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

interface MetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  accentColor?: string;
}

export function MetricTile({
  label,
  value,
  unit,
  subtitle,
  trend,
  trendValue,
  accentColor,
}: MetricTileProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#22252A' : '#FFFFFF',
          borderColor: isDark ? '#373C44' : '#E2E8F0',
        },
      ]}>
      <Text style={[styles.label, { color: isDark ? '#A0AAB3' : Palette.slateGrey }]}>
        {label}
      </Text>

      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            { color: accentColor ?? (isDark ? '#FFFFFF' : '#1C2024') },
          ]}>
          {value != null ? String(value) : ''}
        </Text>
        {unit ? (
          <Text style={[styles.unit, { color: isDark ? '#A0AAB3' : Palette.slateGrey }]}>
            {unit}
          </Text>
        ) : null}
      </View>

      {subtitle || trendValue ? (
        <View style={styles.subRow}>
          {trend ? (
            <Text
              style={[
                styles.trendIcon,
                {
                  color: trend === 'down' ? Palette.radioactiveGrass : trend === 'up' ? '#EF4444' : Palette.slateGrey,
                },
              ]}>
              {trend === 'down' ? '↓ ' : trend === 'up' ? '↑ ' : '→ '}
            </Text>
          ) : null}
          <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : Palette.slateGrey }]}>
            {trendValue ?? subtitle}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 100,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: 12,
    fontWeight: '600',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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