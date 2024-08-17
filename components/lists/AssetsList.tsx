import { FilteredAssetsType } from "@/hooks/useFilteredAssets";
import { IntentContextType, useIntentContext } from "@/hooks/useIntentContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Params } from "@/lib/consts";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedRefreshControl } from "../ThemedRefreshControls";
import { ThemedView } from "../ThemedView";

type AssetsListProps = Pick<FilteredAssetsType, 'filtered' | 'loading' | 'getPage' | 'toggleSelected'>;

export default function AssetsList({
    filtered, loading, getPage, toggleSelected
}: AssetsListProps) {
    const intentContext = useIntentContext();
    const params = useLocalSearchParams<Params>();
    return (
        <ThemedView style={{ flex: 1 }}>
            <FlashList
                data={filtered}
                renderItem={({ item, index }) =>
                    <AssetEntry {...item}
                        toggleSelected={toggleSelected}
                        intentContext={intentContext}
                        index={index}
                        params={params}
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
    uri, id, index, selected, toggleSelected, intentContext, params
}: {
    uri: string,
    id: string,
    index: number,
    selected?: boolean,
    toggleSelected: (id: string) => void,
    intentContext: IntentContextType;
    params: Params;
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
                    // Need to make sure we don't override params
                    // So they can still be handled by _layout.tsx
                    pathname: `/image/[index]`, params: { ...params, index }
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