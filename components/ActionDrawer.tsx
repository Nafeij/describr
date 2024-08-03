import { useIntentContext } from "@/hooks/useIntentContext";
import { Selectable } from "@/hooks/useSelector";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AssetInfo } from "expo-media-library";
import { RefAttributes, useEffect, useState } from "react";
import { Pressable, PressableProps, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AlbumModal from "./AlbumModal";
import { ThemedText } from "./ThemedText";

export default function ActionDrawer({
    filtered,
}: {
    filtered: (AssetInfo & Selectable)[];
}) {
    const [backgroundColor] = useThemeColor({}, ['background']);
    const { intent, setResult, isMatchingType } = useIntentContext();
    const needContent = intent?.action === ActivityAction.GET_CONTENT;
    const drawerHeight = useSharedValue(0);
    const [loading, setLoading] = useState({
        return: false, moveTo: false, copyTo: false, delete: false,
    });
    const [showModal, setShowModal] = useState(false);

    const setAllResult = async () => {
        setLoading(loading => ({ ...loading, return: true }));
        await setResult({
            isOK: true,
            uris: filtered.filter(e => e.selected && isMatchingType(e.uri)).map(e => e.uri),
        });
        setLoading(loading => ({ ...loading, return: false }));
    }

    useEffect(() => {
        drawerHeight.value = filtered.some(e => e.selected) ? 64 : 0;
    }, [filtered]);

    const drawerAnimStyle = useAnimatedStyle(() => ({
        height: withTiming(drawerHeight.value),
    }));

    return (
        <>
            <Animated.View style={[drawerAnimStyle, styles.drawer]} >
                <LinearGradient
                    colors={['transparent', backgroundColor]}
                    style={styles.inner}
                >
                    {
                        needContent &&
                        <DrawerButton icon="upload" text="Return" onPress={setAllResult} disabled={loading.return} />
                    }
                    <DrawerButton icon="folder" text="Move To" onPress={() => setShowModal(true)} />
                    <DrawerButton icon="copy" text="Copy To" />
                    <DrawerButton icon="trash" text="Delete" />
                </LinearGradient>
            </Animated.View>
            <AlbumModal isVisible={showModal} title={"Test"} onClose={() => setShowModal(false)} />
        </>
    );
}

const DrawerButton = ({ icon, text, disabled, ...rest }: {
    icon: keyof typeof Feather.glyphMap,
    text: string,
    disabled?: boolean,
} & PressableProps & RefAttributes<View>) => {
    const [color] = useThemeColor({}, ['text']);
    return (
        <Pressable disabled={disabled} style={({ pressed }) => [styles.button, {
            opacity: pressed || disabled ? 0.5 : 1,
        }]} {...rest}>
            <Feather name={icon} size={20} color={color} />
            <ThemedText type="small" style={{ color }}>{text}</ThemedText>
        </Pressable >
    );
}

const styles = StyleSheet.create({
    drawer: {
        zIndex: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    inner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    button: {
        flexBasis: "17.5%",
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        gap: 2,
        paddingVertical: 14,
    }
});