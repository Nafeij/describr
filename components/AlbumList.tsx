import { useIntentManager } from "@/hooks/useIntentManager";
import { useSelectorContext } from "@/hooks/useSelector";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Asset, AssetInfo, AssetsOptions, getAssetInfoAsync, getAssetsAsync } from "expo-media-library";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { SelectorHeader } from "./SelectorHeader";
import { ThemedRefreshControl } from "./ThemedRefreshControls";
import { ThemedView } from "./ThemedView";


export default function AlbumList({
    preFilters,
    postFilter,
    limit,
    fetchInfo,
    setCounts,
}: {
    preFilters: AssetsOptions,
    postFilter?: (_: AssetInfo) => boolean,
    limit?: number
    fetchInfo?: boolean
    setCounts?: ({ numTotal, numFiltered }: {
        numTotal: number
        numFiltered: number
    }) => void
}) {
    const [refreshing, setRefreshing] = useState(true);
    const [lastPage, setLastPage] = useState<{
        endCursor: string;
        hasNextPage: boolean;
    }>();
    const [assets, setAssets] = useState<AssetInfo[]>([]);
    // const [filtered, setFiltered] = useState<Asset[]>([]);
    const [filtered, setFiltered] = useSelectorContext<Asset>();

    const filter = (newAssets: AssetInfo[]) => {
        if (postFilter) {
            return newAssets.filter(postFilter) as Asset[];
        }
        return newAssets;
    };

    const getPage = async () => {
        if (refreshing || lastPage?.hasNextPage === false || (limit && filtered.length >= limit)) return;
        setRefreshing(true);
        let newAssets: AssetInfo[] = assets;
        let cursor = lastPage?.endCursor;
        while (true) {
            const fetchedPage = (await getAssetsAsync({ ...preFilters, after: cursor }));
            cursor = fetchedPage.endCursor;
            let fetchedAssets: AssetInfo[] = fetchedPage.assets;
            if (fetchInfo) {
                fetchedAssets = await Promise.all(fetchedAssets.map((asset) => getAssetInfoAsync(asset.id)
                ));
            }
            newAssets = newAssets.concat(fetchedAssets);
            const newFiltered = filter(newAssets);
            if (fetchedPage.hasNextPage === false || newFiltered.length > 0) {
                setLastPage(fetchedPage);
                setAssets(newAssets);
                setFiltered(newFiltered);
                break;
            }
        }
        setRefreshing(false);
    };

    useEffect(() => {
        setRefreshing(true);
        (async () => {
            const filtered = filter(assets);
            if (filtered.length > 0) {
                setFiltered(filtered);
                return;
            }
            setFiltered([]);
            await getPage();
        })();
        setRefreshing(false);
    }, [postFilter]);

    useEffect(() => {
        setCounts?.({ numTotal: assets.length, numFiltered: filtered.length });
    }, [assets.length, filtered.length, setCounts]);

    return (
        <>
            {filtered.some((asset) => asset.selected) && <SelectorHeader />}
            <ThemedView style={{ flex: 1 }}>
                <FlashList
                    data={filtered}
                    renderItem={({ item }) => <AssetEntry {...item} />}
                    keyExtractor={(item) => item.id}
                    numColumns={4}
                    estimatedItemSize={200}
                    refreshControl={
                        <ThemedRefreshControl refreshing={refreshing} onRefresh={getPage} />
                    }
                    onEndReachedThreshold={1}
                    onEndReached={getPage}
                />
            </ThemedView>
        </>
    );
}

function AssetEntry({ uri, id, selected }: { uri: string, id: string, selected?: boolean }) {
    const { intent, setResult, isMatchingType } = useIntentManager();
    const [color, background, selectedColor] = useThemeColor({}, ['text', 'background', 'tint']);
    const { toggleSelected } = useSelectorContext<Asset>()[2];
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
                    setResult({ isOK: true, uri });
                    return;
                }
                router.push(`/image/${id}`);
            }}
        >
            <Image
                style={{ flex: 1 }}
                source={{ uri }}
                recyclingKey={id}
                autoplay={false}
            />
            {selected !== undefined && <Feather
                name={selected ? 'plus-circle' : 'circle'}
                size={24}
                color={color}
                style={[styles.check, { backgroundColor: selected ? selectedColor : background }]}
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
        top: 4,
        right: 4,
        borderRadius: 12,
    },
});