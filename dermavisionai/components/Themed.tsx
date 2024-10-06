import { Text as DefaultText, View as DefaultView, useColorScheme } from 'react-native';
import { colors } from '../styles/colors'; 

type Theme = 'light' | 'dark';


type ColorScheme = {
  [key in Theme]: {
    text: string;
    background: string;
   
  }
};


const colorScheme: ColorScheme = {
  light: {
    text: colors.text,
    background: colors.background,
   
  },
  dark: {
    text: colors.textDark,
    background: colors.backgroundDark,
   
  }
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ColorScheme['light']
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colorScheme[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function ThemedText(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function ThemedView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}