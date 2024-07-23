import AlbumList from "@/components/AlbumList";
import { Stack, useLocalSearchParams } from "expo-router";

export default function AlbumView() {
    const { id, title } = useLocalSearchParams<{ id: string, title?: string }>();
    return (
        <>
            <Stack.Screen options={{
                title: title ?? 'Untitled Album',
            }} />
            <AlbumList
                pageOnEnd
                preFilters={{
                    album: id,
                    mediaType: ['photo', 'video'],
                    first: 32,
                    sortBy: 'modificationTime',
                }}
            />
        </>
    );
}