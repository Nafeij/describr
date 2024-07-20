import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityIndicator, RefreshControl, RefreshControlProps } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export const ThemedActivityIndicator = () => {
    const color = useThemeColor({}, 'tint');
    return <ActivityIndicator color={color} size="large" style={{ paddingVertical: 20 }} />
}

export const ThemedRefreshControl = (props: RefreshControlProps) => {
    const [color, backgroundColor] = useThemeColor({}, ['tint', 'background']);
    return <RefreshControl tintColor={color} progressBackgroundColor={backgroundColor} colors={[color]} {...props} />
}