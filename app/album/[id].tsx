import { ThemedRefreshControl } from "@/components/ThemedRefreshControls";
import { useIntentManager } from "@/hooks/useIntentManager";
import { ActivityAction } from "@/modules/intent-manager/src/IntentManager.types";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Asset, getAssetsAsync } from "expo-media-library";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";

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
        <>
            <Stack.Screen options={{
                title: title ?? 'Untitled Album'
            }} />
            <FlashList
                data={assets}
                renderItem={({ item }) => <AssetEntry asset={item} />}
                keyExtractor={(item) => item.id}
                numColumns={4}
                estimatedItemSize={200}
                refreshControl={
                    <ThemedRefreshControl refreshing={refreshing} onRefresh={getPage} />
                }
                onEndReachedThreshold={1}
                onEndReached={getPage}
            />
        </>
    );
}

function AssetEntry({ asset }: { asset: Asset }) {
    const { intent, setResult } = useIntentManager();
    if (intent.action !== ActivityAction.GET_CONTENT) {
        return (<Image
            style={{ flex: 1, aspectRatio: 1 }}
            source={{ uri: asset.uri }}
            recyclingKey={asset.id}
            autoplay={false}
        />)
    }
    return (
        <TouchableOpacity
            style={{ flex: 1, aspectRatio: 1 }}
            onPress={() => {
                setResult({
                    isOK: true,
                    uri: asset.uri
                });
            }}
        >
            <Image
                style={{ flex: 1 }}
                source={{ uri: asset.uri }}
                recyclingKey={asset.id}
                autoplay={false}
            />
        </TouchableOpacity>
    );
}