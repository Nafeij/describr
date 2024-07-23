import { useIntentManager } from "@/hooks/useIntentManager";
import { filterAsync } from "@/lib/utils";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Asset, AssetsOptions, getAssetsAsync } from "expo-media-library";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable } from "react-native";
import { ThemedRefreshControl } from "./ThemedRefreshControls";
import { ThemedView } from "./ThemedView";


export default function AlbumList({
    preFilters,
    postFilter,
    limit,
    pageOnEnd,
}: {
    preFilters: AssetsOptions,
    postFilter?: (_: Asset) => Promise<boolean>,
    limit?: number
    pageOnEnd?: boolean
}) {
    const [refreshing, setRefreshing] = useState(true);
    const [lastPage, setLastPage] = useState<{
        endCursor: string;
        hasNextPage: boolean;
    }>();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filtered, setFiltered] = useState<Asset[]>([]);

    const filter = async (newAssets: Asset[]) => {
        if (postFilter) {
            setFiltered(await filterAsync(newAssets, postFilter));
        } else {
            setFiltered(newAssets);
        }
    };

    const getPage = async () => {
        if (lastPage?.hasNextPage === false || (limit && filtered.length >= limit)) return;
        setRefreshing(true);
        const fetchedPage = (await getAssetsAsync({ ...preFilters, after: lastPage?.endCursor }));
        setLastPage(fetchedPage);
        const newAssets = [...assets, ...fetchedPage.assets];
        setAssets(newAssets);
        await filter(newAssets);
        setRefreshing(false);
    };

    useEffect(() => {
        setRefreshing(true);
        (async () => {
            await filter(assets);
        })();
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
                onEndReached={pageOnEnd ? getPage : undefined}
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