import ActionDrawer from "@/components/ActionDrawer";
import AssetsList from "@/components/lists/AssetsList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useMemo } from "react";

export default function Search() {
    const [color] = useThemeColor({}, ['icon']);
    const { hasSelected, numAssets, filtered, clearAll, ...rest } = useFilteredAssetContext();
    const numSelected = useMemo(() => filtered.filter(e => e.selected).length, [filtered]);
    return (
        <ThemedView style={{ flex: 1, paddingTop: 38 }}>
            <ThemedText type="defaultSemiBold" style={{ padding: 8, paddingTop: 0, color }}>{
                !hasSelected ? `${filtered.length} of ${numAssets} items`
                    : numSelected ? `${numSelected} selected`
                        : "Select item"
            }</ThemedText>
            <AssetsList
                filtered={filtered}
                {...rest}
            />
            <ActionDrawer selected={filtered.filter(e => e.selected)} clearAll={clearAll} />
        </ThemedView>
    );
}