import { Palette } from '@/constants/theme';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';

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
    return isDark ? '#373C44' : '#E2E8F0';
  };

  const cardStyle: ViewStyle = {
    backgroundColor: isDark ? '#22252A' : '#FFFFFF',
    borderColor: getBorderColor(),
    borderWidth: bordered || highlightZone ? (highlightZone ? 1.5 : 1) : 0,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: highlightZone === 'green' 
          ? '0 2px 12px rgba(132, 221, 99, 0.12)' 
          : '0 1px 4px rgba(0, 0, 0, 0.04)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
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