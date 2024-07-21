import AlbumList from "@/components/AlbumList";
import { Asset } from "expo-media-library";
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
        // TODO: Check EXIF
        return false;
    }, [query]);

    return (
        <AlbumList
            limit={96}
            preFilters={{
                mediaType: ['photo', 'video'],
                first: 32,
                sortBy: 'modificationTime',
            }}
            postFilter={filter}
        />
    );
}