import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '@/components/ui/AppLogo';
import { AppText } from '@/components/ui/AppText';
import { AccessibilityBar } from '@/components/ui/AccessibilityBar';
import { Palette } from '@/constants/theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  sourceUrl?: string;
  onRefresh?: () => void;
  showAccessibility?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'eko-dziki',
  subtitle = 'symulacja energii w domu',
  onRefresh,
  showAccessibility = true,
}) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      {/* Brand row with logo, title and refresh button */}
      <View style={styles.brandRow}>
        <Pressable onPress={() => router.push('/')} style={styles.brandLeft}>
          <AppLogo size={36} />
          <View style={styles.titleColumn}>
            <AppText style={[styles.brandTitle, { color: isDark ? '#EDEDED' : Palette.charcoal }]}>
              {title}
            </AppText>
            <AppText style={[styles.brandSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
              {subtitle}
            </AppText>
          </View>
        </Pressable>

        {/* Right side actions: Refresh button */}
        {onRefresh ? (
          <Pressable
            onPress={onRefresh}
            accessibilityRole="button"
            accessibilityLabel="Odśwież dane"
            style={({ pressed }) => [
              styles.refreshBtn,
              {
                backgroundColor: isDark ? '#24272A' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(84, 84, 84, 0.2)',
              },
              pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
            ]}>
            <Ionicons
              name="refresh-outline"
              size={18}
              color={isDark ? '#EDEDED' : Palette.charcoal}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Global Text Size / Accessibility Controller */}
      {showAccessibility ? <AccessibilityBar /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 4,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 1,
    fontWeight: '600',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
      },
      default: {
        elevation: 1,
      },
    }),
  },
});

export default AppHeader;
