import { AlbumThumb, useAlbumsContext } from "@/hooks/useAlbumWithThumbs";
import { useIntentContext } from "@/hooks/useIntentContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { addAssetsToAlbumAsync, AssetInfo, deleteAssetsAsync } from "expo-media-library";
import { RefAttributes, useEffect, useState } from "react";
import { Pressable, PressableProps, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AlbumModal from "./modals/AlbumModal";
import ConfirmModal from "./modals/ConfirmModal";
import { ThemedText } from "./ThemedText";

export default function ActionDrawer({
    selected, clearAll
}: {
    selected: AssetInfo[];
    clearAll: () => void;
}) {
    const [backgroundColor] = useThemeColor({}, ['background']);
    const { intent, setResult, isMatchingType } = useIntentContext();
    const [_, fetchAlbums] = useAlbumsContext();
    const needContent = intent?.action === ActivityAction.GET_CONTENT;
    const drawerHeight = useSharedValue(0);
    const [loading, setLoading] = useState({
        return: false, moveTo: false, copyTo: false, delete: false,
    });
    const [modalAction, dispatchModal] = useState<{ title: string, onSelect: (album: AlbumThumb) => Promise<void> } | undefined>(undefined);
    const [modalConfirm, dispatchConfirm] = useState<{ title: string, onConfirm: () => Promise<void> } | undefined>(undefined);

    const setAllResult = () => {
        setLoading(loading => ({ ...loading, return: true }));
        setResult({
            isOK: true,
            uris: selected.filter(e => isMatchingType(e.uri)).map(e => e.uri),
        }).then(() => setLoading(loading => ({ ...loading, return: false })));
    }

    const addFiles = (copy: boolean) => (
        async (album: AlbumThumb) => {
            setLoading(loading => ({ ...loading, moveTo: !copy, copyTo: copy }));
            try {
                if (await addAssetsToAlbumAsync(selected, album.id, copy)) {
                    clearAll();
                    fetchAlbums();
                }
            } catch (error) {
                console.error("Error adding files to album", error);
            }
            setLoading(loading => ({ ...loading, moveTo: false, copyTo: false }));
            dispatchModal(undefined);
        }
    )

    const deleteFiles = async () => {
        setLoading(loading => ({ ...loading, delete: true }));
        try {
            if (await deleteAssetsAsync(selected)) {
                clearAll();
                fetchAlbums();
            }
        } catch (error) {
            console.error("Error deleting files", error);
        }
        setLoading(loading => ({ ...loading, delete: false }));
    }

    useEffect(() => {
        drawerHeight.value = selected.length ? 64 : 0;
    }, [selected]);

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
                        <DrawerButton icon="upload" text="Return" disabled={loading.return} onPress={setAllResult} />
                    }
                    <DrawerButton icon="folder" text="Move To" disabled={loading.moveTo} onPress={() => dispatchModal({ title: "Move To", onSelect: addFiles(false) })} />
                    <DrawerButton icon="copy" text="Copy To" disabled={loading.copyTo} onPress={() => dispatchModal({ title: "Copy To", onSelect: addFiles(true) })} />
                    <DrawerButton icon="trash" text="Delete" disabled={loading.delete}
                        onPress={() => dispatchConfirm({
                            title: `Delete ${selected.length} files?`,
                            onConfirm: async () => {
                                await deleteFiles();
                                dispatchConfirm(undefined);
                            }
                        })}
                    />
                </LinearGradient>
            </Animated.View>
            <AlbumModal
                title={modalAction?.title || ""}
                onSelect={modalAction?.onSelect}
                onClose={() => dispatchModal(undefined)}
            />
            <ConfirmModal
                title={modalConfirm?.title || ""}
                onConfirm={modalConfirm?.onConfirm}
                onClose={() => dispatchConfirm(undefined)}
            />
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