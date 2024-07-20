import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams } from "expo-router";

export default function Search() {
    const { query } = useLocalSearchParams<{ query: string }>();
    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText>{query}</ThemedText>
        </ThemedView>
    );
}