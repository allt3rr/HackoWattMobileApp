import React from 'react';
import { Palette } from '@/constants/theme';
import {
  Platform,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { AppText } from '@/components/ui/AppText';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  badge?: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1C1F24' : '#EDF1EE',
          borderColor: isDark ? '#373C44' : '#E0E5E2',
        },
      ]}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.item,
              isSelected
                ? {
                    backgroundColor: isDark ? Palette.charcoal : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: isDark ? Palette.radioactiveGrass : Palette.sageGreen,
                    ...Platform.select({
                      web: {
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
                      },
                      default: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.08,
                        shadowRadius: 2,
                        elevation: 1,
                      },
                    }),
                  }
                : { backgroundColor: 'transparent' },
            ]}>
            <AppText
              style={[
                styles.itemText,
                {
                  color: isSelected
                    ? isDark
                      ? Palette.chartreuse
                      : '#1C2024'
                    : isDark
                    ? '#9AA4AF'
                    : Palette.slateGrey,
                  fontWeight: isSelected ? '800' : '600',
                },
              ]}>
              {opt.label}
            </AppText>
            {opt.badge ? (
              <View style={styles.badgeWrap}>
                <AppText style={styles.badgeText}>{opt.badge}</AppText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginVertical: 6,
    flexWrap: 'wrap',
  },
  item: {
    flex: 1,
    minWidth: 80,
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 9,
    gap: 5,
  },
  itemText: {
    fontSize: 12,
    textAlign: 'center',
  },
  badgeWrap: {
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: '#EF4444',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});