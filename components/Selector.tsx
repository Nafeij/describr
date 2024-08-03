import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

export function SelectorHeader({
    numTotal,
    numSelected,
    toggleAll,
    clear,
} : {
    numTotal: number,
    numSelected: number,
    toggleAll: () => void,
    clear: () => void,
}
) {
    const [color, backgroundColor] = useThemeColor({}, ['text', 'field']);
    return (
        <Stack.Screen options={{
            headerTitle: () => (
                <View>
                    <ThemedText type="title" style={{ marginLeft: 30 }}>{numSelected ? `${numSelected} selected` : "Select item"}</ThemedText>
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
                <Pressable onPress={toggleAll} style={[styles.headerRightContainer, { backgroundColor }]}>
                    <ThemedText type="default">{numSelected < numTotal ? "Select all" : "Deselect all"}</ThemedText>
                </Pressable>,

        }} />
    );
}

// export function SelectorFooter() {
//     const [color, backgroundColor] = useThemeColor({}, ['text', 'field']);
//     const [selected, _, { clear }] = useSelectorContext();
//     const numSelected = selected?.filter(e => e.selected).length;
//     return (
//         <View style={[styles.footer, { backgroundColor }]}>
//             <Pressable onPress={clear}>
//                 <ThemedText type="defaultSemiBold" style={{ color }}>Clear</ThemedText>
//             </Pressable>
//             <Pressable style={[styles.headerRightContainer, { backgroundColor }]}>
//                 <ThemedText type="defaultSemiBold">{numSelected ? `Share ${numSelected}` : "Share"}</ThemedText>
//             </Pressable>
//         </View>
//     );
// }

const styles = StyleSheet.create({
    headerRightContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8
    }
});