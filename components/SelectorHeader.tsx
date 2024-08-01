import { useSelectorContext } from "@/hooks/useSelector";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";


export function SelectorHeader() {
    const [color, backgroundColor] = useThemeColor({}, ['text', 'field']);
    const [selected, _, { toggleAll, clear }] = useSelectorContext();
    const numSelected = selected?.filter(e => e.selected).length;
    return (
        <Stack.Screen options={{
            headerTitle: () => (
                <View>
                    <ThemedText type="title" style={{marginLeft: 30}}>{numSelected ? `${numSelected} selected` : "Select item"}</ThemedText>
                </View>
            ),
            headerLeft: () =>
                <Pressable onPress={clear}>
                    <Feather
                        name="x"
                        size={24}
                        color={color}
                    />
                </Pressable>,
            headerBackVisible: false,
            headerRight: () =>
                <Pressable onPress={toggleAll} style={[styles.container, {backgroundColor}]}>
                    <ThemedText type="default">{numSelected < selected.length ? "Select all" : "Deselect all"}</ThemedText>
                </Pressable>,

        }} />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 18,
    },
});