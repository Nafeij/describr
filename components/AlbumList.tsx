import { useIntentManager } from "@/hooks/useIntentManager";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Asset, AssetsOptions, getAssetsAsync } from "expo-media-library";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ThemedRefreshControl } from "./ThemedRefreshControls";
import { ThemedView } from "./ThemedView";


export default function AlbumList({
    preFilters, postFilter = useCallback((() => true), []), limit
}: {
    preFilters: AssetsOptions,
    postFilter?: (_: Asset) => (boolean),
    limit?: number
}) {
    const [refreshing, setRefreshing] = useState(true);
    const [lastPage, setLastPage] = useState<{
        endCursor: string;
        hasNextPage: boolean;
    }>();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filtered, setFiltered] = useState<Asset[]>([]);

    const getPage = async () => {
        if (lastPage?.hasNextPage === false || (limit && filtered.length >= limit)) return;
        setRefreshing(true);
        const fetchedPage = (await getAssetsAsync({ ...preFilters, after: lastPage?.endCursor }));
        setLastPage(fetchedPage);
        const newAssets = [...assets, ...fetchedPage.assets];
        setAssets(newAssets);
        setFiltered(newAssets.filter(postFilter));
        setRefreshing(false);
    };

    useEffect(() => {
        setFiltered(assets.filter(postFilter));
        setRefreshing(false);
    }, [postFilter]);

    useEffect(() => {
        getPage();
    }, []);

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
            onLongPress={() => setResult({ isOK: true, uri })}
            disabled={!selectNeeded || !canSelect}
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