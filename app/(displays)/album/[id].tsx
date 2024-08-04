import ActionDrawer from "@/components/ActionDrawer";
import AssetsList from "@/components/lists/AssetsList";
import { SelectorHeader } from "@/components/Selector";
import { ThemedText } from "@/components/ThemedText";
import { useFilteredAssets } from "@/hooks/useFilteredAssets";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function AlbumView() {
    const { id, title, count } = useLocalSearchParams<{ id: string, title?: string, count?: string }>();
    const [color, muted] = useThemeColor({}, ['text', 'icon']);
    const { filtered, loading, getPage, toggleSelected, toggleAll, clearSelection, refetch } = useFilteredAssets({
        preFilters: {
            album: id,
            mediaType: ['photo', 'video'],
            first: 128,
            sortBy: ['creationTime', 'modificationTime'],
        },
    });
    const hasSelected = filtered.some(e => e.selected !== undefined);
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
                loading={loading}
                getPage={getPage}
                toggleSelected={toggleSelected}
            />
            <ActionDrawer selected={filtered.filter(e => e.selected)} refetch={refetch} />
        </>
    );
}