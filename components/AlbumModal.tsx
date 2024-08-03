import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Modal, Pressable, StyleSheet } from "react-native";

export default function AlbumModal({ title, isVisible, onClose }: {
    title: string,
    isVisible?: boolean,
    onClose?: (uri?: string) => void,
}) {
    const [backgroundColor] = useThemeColor({}, ['field']);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => onClose?.()}
        >
            <Pressable style={{ flex: 1 }} onPress={() => onClose?.()}/>
            <ThemedView style={[styles.modalContent, styles.shadow, { backgroundColor }]}>
                <ThemedText type="title">{title}</ThemedText>
                <Pressable onPress={() => onClose?.("test")}>
                    <ThemedText type="default">Test</ThemedText>
                </Pressable>
            </ThemedView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        flex: 3,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.43,
        shadowRadius: 9.51,
        elevation: 15,
    }
});