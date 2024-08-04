import { ThemedText } from "@/components/ThemedText";
import useAlbumWithThumbs, { AlbumThumb } from "@/hooks/useAlbumWithThumbs";
import { ComponentProps, useEffect } from "react";
import { Pressable, StyleSheet, View, StyleProp } from "react-native";
import AlbumsList from "../lists/AlbumsList";
import BaseModal from "./BaseModal";

export default function AlbumModal({ title, isVisible = false, onSelect, onClose, style}: {
    title: string,
    onSelect?: (album: AlbumThumb) => void,
} & ComponentProps<typeof BaseModal>) {
    const [albums, fetchAlbums] = useAlbumWithThumbs();

    useEffect(() => {
        fetchAlbums();
    }, []);

    return (
        <BaseModal
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