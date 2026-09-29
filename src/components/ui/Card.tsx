import { Palette } from '@/constants/theme';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  bordered?: boolean;
  highlightZone?: 'green' | 'yellow' | 'red';
}

export function Card({
  children,
  className,
  style,
  onPress,
  bordered = true,
  highlightZone,
}: CardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const getBorderColor = () => {
    if (highlightZone === 'green') return Palette.radioactiveGrass;
    if (highlightZone === 'yellow') return '#EAB308';
    if (highlightZone === 'red') return '#EF4444';
    return isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(84, 84, 84, 0.18)';
  };

  const cardStyle: ViewStyle = {
    backgroundColor: isDark ? '#24272A' : '#FFFFFF',
    borderColor: getBorderColor(),
    borderWidth: bordered || highlightZone ? (highlightZone ? 1.5 : 1) : 0,
    borderRadius: 17,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: highlightZone === 'green' 
          ? '0 6px 20px rgba(132, 221, 99, 0.18)' 
          : '0 12px 36px rgba(84, 84, 84, 0.08)',
      },
      default: {
        shadowColor: '#545454',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.85, transform: [{ scale: 0.995 }] },
          style,
        ]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}