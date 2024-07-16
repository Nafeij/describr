import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityIndicator, RefreshControl, RefreshControlProps } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export const ThemedActivityIndicator = () => {
    const color = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
    return <ActivityIndicator color={color} size="large" style={{ paddingVertical: 20 }} />
}

export const ThemedRefreshControl = (props: RefreshControlProps) => {
    const color = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
    const backgroundColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, 'background');
    return <RefreshControl tintColor={color} progressBackgroundColor={backgroundColor} colors={[color]} {...props} />
}