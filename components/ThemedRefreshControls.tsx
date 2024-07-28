import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityIndicator, RefreshControl, RefreshControlProps } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export const ThemedActivityIndicator = () => {
    const [color] = useThemeColor({}, ['text']);
    return <ActivityIndicator color={color} size="large" style={{ paddingVertical: 20 }} />
}

export const ThemedRefreshControl = (props: RefreshControlProps) => {
    const [color, backgroundColor] = useThemeColor({}, ['text', 'background']);
    return <RefreshControl tintColor={color} progressBackgroundColor={backgroundColor} colors={[color]} {...props} />
}