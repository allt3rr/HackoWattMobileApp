import { Text, type TextProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, className, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const typeClasses = {
    default: 'text-base leading-6 font-medium',
    title: 'text-5xl leading-[52px] font-semibold',
    small: 'text-sm leading-5 font-medium',
    smallBold: 'text-sm leading-5 font-bold',
    subtitle: 'text-[32px] leading-[44px] font-semibold',
    link: 'text-sm leading-[30px]',
    linkPrimary: 'text-sm leading-[30px] text-[#3c87f7]',
    code: 'font-mono text-xs font-medium',
  }[type];

  return (
    <Text
      className={`${typeClasses} ${className ?? ''}`}
      style={[{ color: theme[themeColor ?? 'text'] }, style]}
      {...rest}
    />
  );
}
