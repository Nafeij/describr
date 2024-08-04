import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { PropsWithChildren } from "react";
import { Modal, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";

export default function BaseModal({ isVisible = false, style, children, onClose }: {
    isVisible?: boolean,
    style?: StyleProp<ViewStyle>,
    onClose: () => void,
} & PropsWithChildren) {
    const [backgroundColor] = useThemeColor({}, ['field']);
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <Pressable style={{ flex: 1 }} onPress={onClose} >
                <ThemedView style={[styles.modalContent, styles.shadow, { backgroundColor }, style]}>
                    {children}
                </ThemedView>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        flexDirection: 'column',
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