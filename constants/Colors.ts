/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#06607e';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    modal: '#F9FAFB',
    field: '#e9e9e9',
    tint: tintColorLight,
    tintAlt: tintColorDark,
    muted: '#adb3b8',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    confirm: '#2ECC71',
    danger: '#E74C3C',
  },
  dark: {
    text: '#ECEDEE',
    background: '#161616',
    modal: '#1f2122',
    field: '#313436',
    tint: tintColorDark,
    muted: '#64686b',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    confirm: '#156e3a',
    danger: '#b93f30',
  },
};
