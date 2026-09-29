import React from 'react';
import { View, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { router } from 'expo-router';
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
  title = 'EkoDzik Mobile',
  subtitle = 'Inteligentna energia dla domu',
  showAccessibility = true,
}) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      {/* Brand row with logo and title */}
      <View style={styles.brandRow}>
        <Pressable onPress={() => router.push('/')} style={styles.brandLeft}>
          <AppLogo size={38} />
          <View style={styles.titleColumn}>
            <AppText style={[styles.brandTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
              {title}
            </AppText>
            <AppText
              style={[
                styles.brandSubtitle,
                { color: isDark ? '#9AA4AF' : Palette.slateGrey },
              ]}>
              {subtitle}
            </AppText>
          </View>
        </Pressable>
      </View>

      {/* Global Text Size / Accessibility Controller */}
      {showAccessibility ? <AccessibilityBar /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 200,
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
});

export default AppHeader;

