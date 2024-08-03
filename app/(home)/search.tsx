import AlbumList from "@/components/AlbumList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useFilteredAssets } from "@/hooks/useFilteredAssets";
import { useThemeColor } from "@/hooks/useThemeColor";
import { exifToTags } from "@/lib/utils";
import { AssetInfo } from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function Search() {
    const { id, query } = useLocalSearchParams<{ id?: string, query: string }>();
    const {assets, filtered, loading, getPage, toggleSelected, toggleAll, clear} = useFilteredAssets({
        preFilters:{
            album: id,
            mediaType: ['photo', 'video'],
            first: 256,
            sortBy: 'creationTime',
        },
        postFilter: useCallback((asset: AssetInfo) => {
            if (!query
                || asset.filename.toLowerCase().includes(query)
            ) {
                return true;
            }
            if (exifToTags(asset.exif).some(tag => tag.toLowerCase().includes(query))) {
                return true;
            }
            return false;
        }, [query]),
        fetchInfo: true,
    });
    const [color] = useThemeColor({}, ['icon']);

    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={{ padding: 8, paddingTop: 0, color }}>{filtered.length} of {assets.length} items</ThemedText>
            <AlbumList
                filtered={filtered}
                loading={loading}
                getPage={getPage}
                toggleSelected={toggleSelected}
            />
        </ThemedView>
    );
}