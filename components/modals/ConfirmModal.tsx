import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import BaseModal from "./BaseModal";

export default function ConfirmModal({ title, onConfirm, onClose: onCancel, style, ...rest }: {
    title: string,
    onConfirm?: () => void,
    onClose: () => void,
} & ComponentProps<typeof BaseModal>) {
    const [dangerColor, mutedColor] = useThemeColor({}, ['danger', 'muted']);
    return (
        <BaseModal
            animationType="fade"
            style={[styles.modalContent, style]}
            onClose={onCancel}
            isVisible={!!onConfirm}
            {...rest}
        >
            <ThemedText type="title" style={{ textAlign: "center" }}>{title}</ThemedText>
            <View style={{ flexDirection: 'row', gap: 15 }}>
                <Pressable onPress={onConfirm} style={{ flex: 1, alignItems: "center", padding: 5 }}>
                    <ThemedText type="link" style={{ color: dangerColor }}>Confirm</ThemedText>
                </Pressable>
                <View style={{ width: 1, backgroundColor: mutedColor }} />
                <Pressable onPress={onCancel} style={{ flex: 1, alignItems: "center", padding: 5 }}>
                    <ThemedText type="link">Cancel</ThemedText>
                </Pressable>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        marginTop: "70%",
        marginHorizontal: 30,
        padding: 30,
        gap: 30,
    }
});