import AlbumList from "@/components/AlbumList";
import { Asset, getAssetInfoAsync } from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

export default function Search() {
    const { query } = useLocalSearchParams<{ query: string }>();

    const filter = useCallback(async (asset: Asset) => {
        if (!query
            || asset.filename.toLowerCase().includes(query.toLowerCase())
        ) {
            return true;
        }
        const exif = (await getAssetInfoAsync(asset)).exif;
        if (exif && Object.values(exif).some(value => typeof value === "string" && value?.toLowerCase().includes(query.toLowerCase()))) {
            return true;
        }
        return false;
    }, [query]);

    return (
        <AlbumList
            preFilters={{
                mediaType: ['photo', 'video'],
                first: 32,
                sortBy: 'modificationTime',
            }}
            postFilter={filter}
            pageOnEnd
        />
    );
}