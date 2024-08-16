import ActionDrawer from "@/components/ActionDrawer";
import AssetsList from "@/components/lists/AssetsList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function Search() {
    const [color] = useThemeColor({}, ['icon']);
    const { assets, filtered, loading, getPage, toggleSelected, refetch } = useFilteredAssetContext().search;
    const hasSelected = filtered.some(e => e.selected !== undefined);
    const numSelected = filtered.filter(e => e.selected).length;
    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={{ padding: 8, paddingTop: 0, color }}>{
                !hasSelected ? `${filtered.length} of ${assets.length} items`
                    : numSelected ? `${numSelected} selected`
                        : "Select item"
            }</ThemedText>
            <AssetsList
                filtered={filtered}
                loading={loading}
                getPage={getPage}
                toggleSelected={toggleSelected}
                from="search"
            />
            <ActionDrawer selected={filtered.filter(e => e.selected)} refetch={refetch} />
        </ThemedView>
    );
}