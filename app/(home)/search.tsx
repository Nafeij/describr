import AlbumList from "@/components/AlbumList";
import { exifToTags } from "@/lib/utils";
import { AssetInfo, getAssetInfoAsync } from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function Search() {
    const { id, query } = useLocalSearchParams<{ id?: string, query: string }>();

    const filter = useCallback((asset: AssetInfo) => {
        if (!query
            || asset.filename.toLowerCase().includes(query)
        ) {
            return true;
        }
        if (exifToTags(asset.exif).some(tag => tag.toLowerCase().includes(query))) {
            return true;
        }
        return false;
    }, [query]);

    return (
        <AlbumList
            preFilters={{
                album: id,
                mediaType: ['photo', 'video'],
                first: 256,
                sortBy: 'creationTime',
            }}
            postFilter={filter}
            fetchInfo
        />
    );
}