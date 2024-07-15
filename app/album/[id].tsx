import { ThemedText } from "@/components/ThemedText";
import { useLocalSearchParams } from "expo-router";

// import { FlashList } from "@shopify/flash-list";

export default function Album() {
    const { id } = useLocalSearchParams();
    return (
        <ThemedText type="title">Album {id}</ThemedText>
    );
}