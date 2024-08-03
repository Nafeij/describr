import AlbumList from "@/components/AlbumList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useEffect } from "react";

export default function Search() {
    const [color] = useThemeColor({}, ['icon']);
    const { assets, filtered, loading, getPage, toggleSelected, clear } = useFilteredAssetContext();
    const hasSelected = filtered.some(e => e.selected !== undefined);
    const numSelected = filtered.filter(e => e.selected).length;
    useEffect(() => (clear), []);
    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={{ padding: 8, paddingTop: 0, color }}>{
                !hasSelected ? `${filtered.length} of ${assets.length} items`
                    : numSelected ? `${numSelected} selected`
                        : "Select item"
            }</ThemedText>
            <AlbumList
                filtered={filtered}
                loading={loading}
                getPage={getPage}
                toggleSelected={toggleSelected}
            />
        </ThemedView>
    );
}