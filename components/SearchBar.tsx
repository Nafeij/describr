import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export const SearchBar = () => {
    const { query: _query } = useLocalSearchParams<{ query: string }>();
    const [query, setQuery] = useState(_query);
    const isInSearch = usePathname().endsWith("search");
    const ref = useRef<TextInput>(null);
    const [selected, setSelected] = useState(false);
    const [activeColor, color, backgroundColor] = useThemeColor({}, ['tint', 'icon', 'modal']);

    const clear = () => {
        console.log("clearing query", query);
        if (query) {
            setQuery("");
        } else if (ref.current?.isFocused()) {
            ref.current?.blur();
        } else {
            router.back();
        }
    };

    useEffect(() => {
        if (query !== _query) {
            router.setParams({ query });
        }
    }, [query]);

    useEffect(() => {
        if (selected) {
            !isInSearch && router.push("search");
        }
    }, [selected]);

    useEffect(() => {
        if (!isInSearch) {
            setQuery("");
            setSelected(false);
            ref.current?.blur();
        }
    }, [isInSearch]);

    return <View style={[styles.container, { backgroundColor }]}>
        <Feather
            name="search"
            size={20}
            color={color}
            style={{ marginLeft: 1 }}
        />
        <TextInput
            ref={ref}
            placeholder="Search"
            style={{
                color: activeColor,
                flex: 1,
            }}
            value={query}
            onFocus={() => setSelected(true)}
            onBlur={() => setSelected(false)}
            onChangeText={query => setQuery(query)}
            placeholderTextColor={color}
        />
        {
            (selected || query || isInSearch) && <Feather
                name="x"
                size={20}
                color={color}
                onPress={clear}
            />
        }
    </View>
}

const styles = StyleSheet.create({
    container: {
        margin: 12,
        marginBottom: 16,
        paddingVertical: 4,
        paddingHorizontal: 10,
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        borderRadius: 18,
    },
});