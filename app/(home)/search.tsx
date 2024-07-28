import AlbumList from "@/components/AlbumList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { exifToTags } from "@/lib/utils";
import { AssetInfo } from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

export default function Search() {
    const { id, query } = useLocalSearchParams<{ id?: string, query: string }>();
    const [{ numTotal, numFiltered }, setCounts] = useState({ numTotal: 0, numFiltered: 0 });
    const [color] = useThemeColor({}, ['icon']);

    const setCountHandle = useCallback(({ numTotal, numFiltered }: { numTotal: number, numFiltered: number }) => {
        setCounts({ numTotal, numFiltered });
    }, []);

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
        <ThemedView style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={{ padding: 8, paddingTop: 0, color }}>{numFiltered} of {numTotal} items</ThemedText>
            <AlbumList
                preFilters={{
                    album: id,
                    mediaType: ['photo', 'video'],
                    first: 256,
                    sortBy: 'creationTime',
                }}
                postFilter={filter}
                setCounts={setCountHandle}
                fetchInfo
            />
        </ThemedView>
    );
}