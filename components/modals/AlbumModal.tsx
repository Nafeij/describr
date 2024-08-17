import { ThemedText } from "@/components/ThemedText";
import { AlbumThumb, useAlbumsContext } from "@/hooks/useAlbumWithThumbs";
import { ComponentProps, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import AlbumsList from "../lists/AlbumsList";
import BaseModal from "./BaseModal";

export default function AlbumModal({ title, onSelect, onClose, style }: {
    title: string,
    onSelect?: (album: AlbumThumb) => void,
} & ComponentProps<typeof BaseModal>) {
    const [albums, fetchAlbums] = useAlbumsContext();

    useEffect(() => {
        fetchAlbums();
    }, []);

    return (
        <BaseModal
            animationType="slide"
            style={[styles.modalContent, style]}
            onClose={onClose}
            isVisible={!!onSelect}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText type="title">{title}</ThemedText>
                <Pressable onPress={() => onClose()}>
                    <ThemedText type="link">Cancel</ThemedText>
                </Pressable>
            </View>
            <AlbumsList
                refreshing={false}
                albums={albums}
                onRefresh={fetchAlbums}
                onPress={(album) => onSelect?.(album)}
            />
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        marginTop: "50%",
        gap: 16,
    }
});