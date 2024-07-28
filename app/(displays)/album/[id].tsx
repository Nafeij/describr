import AlbumList from "@/components/AlbumList";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function AlbumView() {
    const { id, title, count } = useLocalSearchParams<{ id: string, title?: string, count?: string }>();
    const [color, muted] = useThemeColor({}, ['text', 'icon']);

    return (
        <>
            <Stack.Screen options={{
                headerTitle: () => (
                    <View>
                        <ThemedText type="title">{title}</ThemedText>
                        <ThemedText type="default" style={{ color: muted }}>{count}</ThemedText>
                    </View>
                ),
                title: title ?? "Untitled Album",
                headerRight: () =>
                    <Link href={{ pathname: "search", params: { id } }} push>
                        <Feather
                            name="search"
                            size={20}
                            color={color}
                            style={{ marginRight: 16 }}
                        />
                    </Link>
            }} />
            <AlbumList
                preFilters={{
                    album: id,
                    mediaType: ['photo', 'video'],
                    first: 128,
                    sortBy: ['creationTime', 'modificationTime'],
                }}
            />
        </>
    );
}