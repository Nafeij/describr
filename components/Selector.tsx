import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";

export function SelectorHeader({
    numTotal,
    numSelected,
    toggleAll,
    clear,
}: {
    numTotal: number,
    numSelected: number,
    toggleAll: () => void,
    clear: () => void,
}
) {
    const [color] = useThemeColor({}, ['text']);
    return (
        <Stack.Screen options={{
            headerTitle: () => (
                <View>
                    <ThemedText type="title" style={{ marginLeft: 25 }}>{numSelected ? `${numSelected} selected` : "Select item"}</ThemedText>
                </View>
            ),
            headerLeft: () =>
                <Pressable onPress={clear}>
                    <Feather
                        name="x"
                        size={24}
                        color={color}
                        style={{ padding: 6, marginLeft: -6 }}
                    />
                </Pressable>,
            headerBackVisible: false,
            headerRight: () =>
                <SelectAllButton
                    isAllSelected={numSelected === numTotal}
                    toggleAll={toggleAll}
                />,

        }} />
    );
}

export const SelectAllButton = ({
    isAllSelected,
    toggleAll,
    style
}: {
    isAllSelected: boolean,
    toggleAll: () => void,
    style?: ViewStyle
}) => {
    const [backgroundColor] = useThemeColor({}, ['field']);
    return <Pressable onPress={toggleAll} style={[styles.headerRightContainer, { backgroundColor }, style]}>
        <ThemedText
            type="default"
            numberOfLines={1}
            ellipsizeMode="clip"
        >
            {isAllSelected ? "Deselect all" : "Select all"}
        </ThemedText>
    </Pressable>
}

// TODO
// export function SelectorFooter() {
//     const [color, backgroundColor] = useThemeColor({}, ['text', 'field']);
//     const {filtered, clear} = useFilteredAssetContext();
//     const {intent, isMatchingType, setResult} = useIntentContext();
//     const hasSelected = filtered.some(e => e.selected);

// }

const styles = StyleSheet.create({
    headerRightContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 18,
        flexDirection: 'row',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8
    }
});