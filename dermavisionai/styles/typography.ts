import { StyleSheet } from 'react-native';
import { colors } from './colors';


const fontSizes = {
  tiny: 10,
  small: 12,
  regular: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
  huge: 28,
};

const fontWeights: { [key: string]: "100" | "300" | "400" | "500" | "700" | "900" } = {
  thin: "100",
  light: "300",
  regular: "400",
  medium: "500",
  bold: "700",
  black: "900",
};

export const typography = StyleSheet.create({
  h1: {
    fontSize: fontSizes.huge,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: 16,
  },
  h2: {
    fontSize: fontSizes.xxlarge,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: 14,
  },
  h3: {
    fontSize: fontSizes.xlarge,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: 12,
  },
  h4: {
    fontSize: fontSizes.large,
    fontWeight: fontWeights.medium,
    color: colors.text,
    marginBottom: 10,
  },
  h5: {
    fontSize: fontSizes.medium,
    fontWeight: fontWeights.medium,
    color: colors.text,
    marginBottom: 8,
  },
  body: {
    fontSize: fontSizes.regular,
    fontWeight: fontWeights.regular,
    color: colors.text,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: fontSizes.small,
    fontWeight: fontWeights.regular,
    color: colors.text,
    lineHeight: 18,
  },
  caption: {
    fontSize: fontSizes.tiny,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
  },
  button: {
    fontSize: fontSizes.medium,
    fontWeight: fontWeights.medium,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  link: {
    fontSize: fontSizes.regular,
    fontWeight: fontWeights.regular,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  error: {
    fontSize: fontSizes.small,
    fontWeight: fontWeights.regular,
    color: colors.error,
  },
  success: {
    fontSize: fontSizes.small,
    fontWeight: fontWeights.regular,
    color: colors.success,
  },
});