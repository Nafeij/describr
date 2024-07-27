import AlbumList from "@/components/AlbumList";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { SortByValue } from "expo-media-library";
import { Link, Stack, useLocalSearchParams } from "expo-router";

export default function AlbumView() {
    const { id, title } = useLocalSearchParams<{ id: string, title?: string }>();
    const [color] = useThemeColor({}, ['text']);
    return (
        <>
            <Stack.Screen options={{
                title: title ?? 'Untitled Album',
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