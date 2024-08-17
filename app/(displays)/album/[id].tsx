import ActionDrawer from "@/components/ActionDrawer";
import AssetsList from "@/components/lists/AssetsList";
import { SelectorHeader } from "@/components/Selector";
import { ThemedText } from "@/components/ThemedText";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { Link, Stack, useGlobalSearchParams } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

export default function AlbumView() {
    const { id, title, count } = useGlobalSearchParams<{ id?: string, title?: string, count?: string }>();
    const [color, muted] = useThemeColor({}, ['text', 'icon']);
    const { filtered, toggleAll, clearSelection, clearAll, ...rest } = useFilteredAssetContext().album;
    const hasSelected = useMemo(() => filtered.some(e => e.selected !== undefined), [filtered]);
    return (
        <>
            {hasSelected ? <SelectorHeader
                numTotal={filtered.length}
                numSelected={filtered.filter(e => e.selected).length}
                toggleAll={toggleAll}
                clear={clearSelection}
            /> : <Stack.Screen options={{
                headerTitle: () => (
                    <View>
                        <ThemedText type="title">{title}</ThemedText>
                        <ThemedText type="default" style={{ color: muted }}>{`${count} items`}</ThemedText>
                    </View>
                ),
                headerBackVisible: true,
                headerLeft: () => <></>,
                headerRight: () =>
                    <Link href={{ pathname: "/search", params: { id } }} push>
                        <Feather
                            name="search"
                            size={20}
                            color={color}
                            style={{ marginRight: 16 }}
                        />
                    </Link>,
            }} />}
            <AssetsList
                filtered={filtered}
                {...rest}
                from="album"
            />
            <ActionDrawer selected={filtered.filter(e => e.selected)} clearAll={clearAll} />
        </>
    );
}