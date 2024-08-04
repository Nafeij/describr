import { AlbumThumb } from "@/hooks/useAlbumWithThumbs";
import { FlashList } from "@shopify/flash-list";
import { Image } from 'expo-image';
import { Pressable, StyleSheet } from "react-native";
import { ThemedRefreshControl } from "./ThemedRefreshControls";
import { ThemedText } from "./ThemedText";

export default function AlbumsList({
    refreshing,
    albums,
    onRefresh,
    onPress,
}: {
    refreshing: boolean;
    albums: AlbumThumb[];
    onRefresh: () => void;
    onPress?: (album: AlbumThumb) => void;
}) {
    return <FlashList
        data={albums}
        renderItem={({ item }) => <AlbumEntry album={item} onPress={onPress} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        estimatedItemSize={50}
        refreshControl={
            <ThemedRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
    />
}

const AlbumEntry = ({ album, onPress }: {
    album: AlbumThumb,
    onPress?: (album: AlbumThumb) => void
}) => {
    return (
        <Pressable
            onPress={() => onPress?.(album)}
            style={({ pressed }) => [styles.albumContainer, {
                opacity: pressed ? 0.5 : 1,
                padding: pressed ? 12 : 4,
            }]}
        >
            <Image
                source={{ uri: album.thumbnail?.uri }}
                style={{ width: "100%", aspectRatio: 1 }}
                autoplay={false}
            />
            <ThemedText type='defaultSemiBold' numberOfLines={1}>
                {album.title}
            </ThemedText>
            <ThemedText type='small' numberOfLines={1} style={{ opacity: 0.7 }}>
                {album.assetCount}
            </ThemedText>
        </Pressable >
    );
}

const styles = StyleSheet.create({
    albumContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
    },
});