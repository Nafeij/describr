/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from "react-native";

import { Colors } from "@/constants/Colors";

type ColorKey = keyof typeof Colors.light & keyof typeof Colors.dark;

type ColorInput = ColorKey | ColorKey[];

function isKey(obj: ColorInput): obj is ColorKey {
  return typeof obj === "string";
}

type ColorType<T extends ColorInput, U> = T extends ColorKey
  ? U
  : T extends ColorKey[]
  ? U[]
  : never;

export function useThemeColor<T extends ColorInput>(
  props: { light?: string; dark?: string },
  color: T
): ColorType<T, string> {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    if (typeof color === "string") {
      return colorFromProps as ColorType<T, string>;
    } else {
      return color.map(() => colorFromProps) as ColorType<T, string>;
    }
  } else {
    if (isKey(color)) {
      return Colors[theme][color] as ColorType<T, string>;
    } else {
      return color.map((c) => Colors[theme][c]) as ColorType<T, string>;
    }
  }
}
