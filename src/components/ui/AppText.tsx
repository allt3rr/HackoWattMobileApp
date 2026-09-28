import React from 'react';
import { StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';
import { useTextScale } from '@/context/TextScaleContext';

export interface AppTextProps extends TextProps {
  allowScaling?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({ style, allowScaling = true, ...props }) => {
  const { scale } = useTextScale();

  if (!allowScaling || scale === 1) {
    return <RNText style={style} {...props} />;
  }

  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  if (!flat) {
    return <RNText style={style} {...props} />;
  }

  const scaledStyle: TextStyle = { ...flat };
  if (typeof flat.fontSize === 'number') {
    scaledStyle.fontSize = Math.round(flat.fontSize * scale);
  }
  if (typeof flat.lineHeight === 'number') {
    scaledStyle.lineHeight = Math.round(flat.lineHeight * scale);
  }

  return <RNText style={scaledStyle} {...props} />;
};

export default AppText;
