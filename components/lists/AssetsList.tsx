import { useIntentContext } from "@/hooks/useIntentContext";
import { Selectable } from "@/hooks/useSelector";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Asset } from "expo-media-library";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedRefreshControl } from "../ThemedRefreshControls";
import { ThemedView } from "../ThemedView";


export default function AssetsList({
    filtered, loading, getPage, toggleSelected, from
}: {
    filtered: (Asset & Selectable)[];
    loading: boolean;
    getPage: () => void;
    toggleSelected: (id: string) => void;
    from: "search" | "album";
}) {
    const intentContext = useIntentContext();
    return (
        <ThemedView style={{ flex: 1 }}>
            <FlashList
                data={filtered}
                renderItem={({ item, index }) =>
                    <AssetEntry {...item}
                        toggleSelected={toggleSelected}
                        intentContext={intentContext}
                        index={index}
                        from={from}
                    />}
                keyExtractor={(item) => item.id}
                numColumns={4}
                estimatedItemSize={200}
                refreshControl={
                    <ThemedRefreshControl refreshing={loading} onRefresh={getPage} />
                }
                onEndReachedThreshold={1}
                onEndReached={getPage}
            />
        </ThemedView>
    );
}

function AssetEntry({
    uri, id, index, selected, toggleSelected, intentContext, from
}: {
    uri: string,
    id: string,
    index: number,
    selected?: boolean,
    toggleSelected: (id: string) => void,
    intentContext: ReturnType<typeof useIntentContext>;
    from: "search" | "album";
}) {
    const [color, selectedColor] = useThemeColor({}, ['text', 'tint']);
    const { intent, setResult, isMatchingType } = intentContext;
    const needContent = intent?.action === ActivityAction.GET_CONTENT;
    const isContentType = useMemo(() => isMatchingType(uri), [uri]);
    return (
        <Pressable
            style={({ pressed }) => [styles.imageContainer, { opacity: selected === false || (needContent && !isContentType) ? 0.5 : 1, padding: pressed ? 8 : 0 }]}
            onLongPress={() => {
                selected === undefined && toggleSelected(id);
            }}
            onPress={() => {
                if (selected !== undefined) {
                    toggleSelected(id);
                    return;
                }
                if (needContent && isContentType) {
                    setResult({ isOK: true, uris: [uri] });
                    return;
                }
                router.push({
                    pathname: `/image/[index]`, params: { index, from }
                });
            }}
        >
            <Image
                style={{ flex: 1 }}
                source={{ uri }}
                recyclingKey={id}
                autoplay={false}
            />
            {selected !== undefined && <Feather
                name={selected ? 'check' : 'circle'}
                size={selected ? 20 : 24}
                color={color}
                style={[styles.check, {
                    backgroundColor: selected ? selectedColor : "transparent",
                    padding: selected ? 2 : 0,
                }]}
            />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        flex: 1,
        aspectRatio: 1,
        position: 'relative',
    },
    check: {
        position: 'absolute',
        top: 6,
        right: 6,
        borderRadius: 12,
    },
});