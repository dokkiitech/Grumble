import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { AppFonts } from '@/constants/theme';

export type TextProps = RNTextProps & {
  weight?: 'regular' | 'medium' | 'bold';
};

export function Text({ style, weight = 'regular', ...props }: TextProps) {
  const fontFamily = {
    regular: AppFonts.regular,
    medium: AppFonts.medium,
    bold: AppFonts.bold,
  }[weight];

  return (
    <RNText
      style={[styles.defaultText, { fontFamily }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: AppFonts.regular,
  },
});
