import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Pulpit</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="bolt.fill"
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Label>Harmonogram</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="clock.badge.checkmark.fill"
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="devices">
        <NativeTabs.Trigger.Label>Urządzenia</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="washer.fill"
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="analytics">
        <NativeTabs.Trigger.Label>Analiza</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="chart.xyaxis.line"
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="solar">
        <NativeTabs.Trigger.Label>Fotowoltaika</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="sun.max.fill"
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
