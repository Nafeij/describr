import { ThemedText } from "@/components/ThemedText";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import BaseModal from "./BaseModal";

export default function ConfirmModal({ title, isVisible = false, onConfirm, onClose: onCancel, style, ...rest }: {
    title: string,
    onConfirm?: () => void,
    onClose: () => void,
} & ComponentProps<typeof BaseModal>) {
    return (
        <BaseModal
            style={[styles.modalContent, style]}
            onClose={onCancel}
            isVisible={!!onConfirm}
            {...rest}
        >
            <ThemedText type="title">{title}</ThemedText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Pressable onPress={onConfirm}>
                    <ThemedText type="link">Confirm</ThemedText>
                </Pressable>
                <Pressable onPress={onCancel}>
                    <ThemedText type="link">Cancel</ThemedText>
                </Pressable>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        gap: 16,
    }
});