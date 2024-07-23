import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Stack, useLocalSearchParams } from "expo-router";

export default function ImageView() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <ThemedView>
            <ThemedText>{id}</ThemedText>
        </ThemedView>
    );
}