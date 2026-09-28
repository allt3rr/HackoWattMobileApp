import { Palette } from '@/constants/theme';
import { AppLogo } from '@/components/ui/AppLogo';
import { Ionicons } from '@expo/vector-icons';
import { router, Slot, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

interface TabItem {
  name: string;
  href: '/' | '/schedule' | '/devices' | '/analytics' | '/solar';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { name: 'index', href: '/', label: 'Pulpit', icon: 'flash' },
  { name: 'schedule', href: '/schedule', label: 'Harmonogram', icon: 'time' },
  { name: 'devices', href: '/devices', label: 'Urządzenia', icon: 'calculator' },
  { name: 'analytics', href: '/analytics', label: 'Analiza', icon: 'bar-chart' },
  { name: 'solar', href: '/solar', label: 'Fotowoltaika', icon: 'sunny' },
];

export default function AppTabs() {
  const pathname = usePathname();
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.outerContainer}>
      {/* Top Navigation Bar on Web */}
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: isDark ? '#181A1D' : '#FFFFFF',
            borderBottomColor: isDark ? '#2E333A' : '#E2E8F0',
            ...Platform.select({
              web: {
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              },
            }),
          },
        ]}>
        <View style={styles.navContent}>
          {/* Brand Logo & Name */}
          <Pressable onPress={() => router.push('/')} style={styles.brandGroup}>
            <AppLogo size={32} />
            <View>
              <Text style={[styles.brandTitle, { color: isDark ? '#FFFFFF' : '#1C2024' }]}>
                EkoDzik Mobile
              </Text>
              <Text style={[styles.brandSubtitle, { color: isDark ? '#9AA4AF' : Palette.slateGrey }]}>
                Dla Seniorów i Młodzieży
              </Text>
            </View>
          </Pressable>

          {/* Tab Navigation Links */}
          <View style={styles.tabsRow}>
            {TABS.map((tab) => {
              const isFocused =
                tab.href === '/'
                  ? pathname === '/' || pathname === ''
                  : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);

              return (
                <Pressable
                  key={tab.name}
                  onPress={() => {
                    if (!isFocused) {
                      router.push(tab.href);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.tabButton,
                    isFocused
                      ? isDark
                        ? styles.tabActiveDark
                        : styles.tabActiveLight
                      : styles.tabInactive,
                    pressed && { opacity: 0.8 },
                  ]}>
                  <Ionicons
                    name={tab.icon}
                    size={15}
                    color={
                      isFocused
                        ? isDark
                          ? Palette.chartreuse
                          : '#0F172A'
                        : isDark
                        ? '#9AA4AF'
                        : Palette.slateGrey
                    }
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused
                          ? isDark
                            ? Palette.chartreuse
                            : '#0F172A'
                          : isDark
                          ? '#9AA4AF'
                          : Palette.slateGrey,
                        fontWeight: isFocused ? '800' : '600',
                      },
                    ]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Screen Slot Content */}
      <View style={styles.screenContainer}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  navBar: {
    width: '100%',
    borderBottomWidth: 1,
    zIndex: 100,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  navContent: {
    width: '100%',
    maxWidth: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Palette.radioactiveGrass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    cursor: 'pointer',
  },
  tabActiveLight: {
    backgroundColor: Palette.chartreuse,
    borderWidth: 1,
    borderColor: Palette.radioactiveGrass,
  },
  tabActiveDark: {
    backgroundColor: 'rgba(132, 221, 99, 0.16)',
    borderWidth: 1,
    borderColor: Palette.radioactiveGrass,
  },
  tabInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
  },
  screenContainer: {
    flex: 1,
    width: '100%',
  },
});
