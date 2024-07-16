import { ThemedRefreshControl } from "@/components/ThemedRefreshControls";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Asset, getAssetsAsync, PagedInfo } from "expo-media-library";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

// import { FlashList } from "@shopify/flash-list";

export default function AlbumList() {
    const [refreshing, setRefreshing] = useState(true);
    const { id, title } = useLocalSearchParams<{ id: string, title?: string }>();
    const [lastPage, setLastPage] = useState<PagedInfo<Asset>>();
    const [assets, setAssets] = useState<Asset[]>([]);

    const getPage = async () => {
        if (lastPage?.hasNextPage === false) return;
        setRefreshing(true);
        const fetchedPage = await getAssetsAsync({ album: id, mediaType: ["photo", "video"], first: 80, after: lastPage?.endCursor, sortBy: 'modificationTime' });
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
    return (
        <Image
            source={{ uri: asset.uri }}
            recyclingKey={asset.id}
            style={{ flex: 1, aspectRatio: 1 }}
        />
    );
}