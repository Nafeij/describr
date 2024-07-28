import { useIntentManager } from "@/hooks/useIntentManager";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Asset, AssetInfo, AssetsOptions, getAssetInfoAsync, getAssetsAsync } from "expo-media-library";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable } from "react-native";
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
    const [filtered, setFiltered] = useState<Asset[]>([]);

    const filter = (newAssets: AssetInfo[]) => {
        if (postFilter) {
            return newAssets.filter(postFilter);
        }
        return newAssets;
    };

    const getPage = async () => {
        if (refreshing || lastPage?.hasNextPage === false || (limit && filtered.length >= limit)) return;
        setRefreshing(true);
        let newAssets: Asset[] = assets;
        let cursor = lastPage?.endCursor;
        while (true) {
            const fetchedPage = (await getAssetsAsync({ ...preFilters, after: cursor }));
            cursor = fetchedPage.endCursor;
            let fetchedAssets: Asset[] = fetchedPage.assets;
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
    );
}

function AssetEntry({ uri, id }: { uri: string, id: string }) {
    const { intent, setResult, isMatchingType } = useIntentManager();
    const canSelect = useMemo(() => isMatchingType(uri), [uri]);
    const selectNeeded = intent?.action === ActivityAction.GET_CONTENT;
    return (
        <Pressable
            style={({ pressed }) => [{ flex: 1, aspectRatio: 1, opacity: selectNeeded && !canSelect ? 0.5 : 1, padding: pressed ? 8 : 0 }]}
            onLongPress={() => selectNeeded && canSelect && setResult({ isOK: true, uri })}
            onPress={() => {
                router.push(`/image/${id}`);
            }}
        >
            <Image
                style={{ flex: 1 }}
                source={{ uri }}
                recyclingKey={id}
                autoplay={false}
            />
        </Pressable>
    );
}