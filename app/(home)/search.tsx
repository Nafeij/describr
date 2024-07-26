import AlbumList from "@/components/AlbumList";
import { exifToTags } from "@/lib/utils";
import { Asset, getAssetInfoAsync } from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function Search() {
    const { id, query } = useLocalSearchParams<{ id?: string, query: string }>();

    const filter = useCallback(async (asset: Asset) => {
        if (!query
            || asset.filename.toLowerCase().includes(query.toLowerCase())
        ) {
            return true;
        }
        const assetInfo = await getAssetInfoAsync(asset);
        if (exifToTags(assetInfo?.exif).some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
            return true;
        }
        return false;
    }, [query]);

    return (
        <AlbumList
            preFilters={{
                album: id,
                mediaType: ['photo', 'video'],
                first: 128,
                sortBy: 'creationTime',
            }}
            postFilter={filter}
            pageOnEnd
        />
    );
}