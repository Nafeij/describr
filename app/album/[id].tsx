import { ThemedRefreshControl } from "@/components/ThemedRefreshControls";
import { ThemedView } from "@/components/ThemedView";
import { useIntentManager } from "@/hooks/useIntentManager";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Asset, getAssetsAsync } from "expo-media-library";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";

// import { FlashList } from "@shopify/flash-list";

export default function AlbumList() {
    const [refreshing, setRefreshing] = useState(true);
    const { id, title } = useLocalSearchParams<{ id: string, title?: string }>();
    const [lastPage, setLastPage] = useState<{
        endCursor: string;
        hasNextPage: boolean;
    }>();
    const [assets, setAssets] = useState<Asset[]>([]);

    const getPage = async () => {
        if (lastPage?.hasNextPage === false) return;
        setRefreshing(true);
        const fetchedPage = await getAssetsAsync({ album: id, mediaType: ["photo", "video"], first: 40, after: lastPage?.endCursor, sortBy: 'modificationTime' });
        setLastPage(fetchedPage);
        setAssets([...assets, ...fetchedPage.assets]);
        setRefreshing(false);
    }

    useEffect(() => {
        getPage();
    }, []);

    return (
        <ThemedView style={{ flex: 1 }}>
            <Stack.Screen options={{
                title: title ?? 'Untitled Album',
            }} />
            <FlashList
                data={assets}
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
    const canSelect = isMatchingType(uri);
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