import { useDebounce } from "@/hooks/useDebounce";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleProp, StyleSheet, TextInput, View, ViewStyle } from "react-native";

export const SearchBar = ({ styles: propStyles }: { styles?: StyleProp<ViewStyle> }) => {
    const { query: _query } = useLocalSearchParams<{ query: string }>();
    const { filtered, clear: clearSelector } = useFilteredAssetContext();
    const [query, setQuery] = useState(_query);
    const debouncedSetParams = useDebounce({
        callback: () => {
            router.setParams({ query: query?.trim().toLowerCase() });
        },
        delay: 500,
    });
    const isInSearch = usePathname().endsWith("search");
    const ref = useRef<TextInput>(null);
    const [selected, setSelected] = useState(false);
    const [color, mutedColor, backgroundColor] = useThemeColor({}, ['text', 'icon', 'field']);

    const clearSearch = () => {
        if (filtered.some(e => e.selected !== undefined)) {
            clearSelector();
        } else if (query) {
            setQuery("");
        } else if (ref.current?.isFocused()) {
            ref.current?.blur();
        } else if (router.canGoBack()) {
            router.back();
        }
    };

    useEffect(() => {
        if (query !== _query) {
            debouncedSetParams();
        }
    }, [query]);

    useEffect(() => {
        if (selected) {
            !isInSearch && router.push("/search");
        }
    }, [selected]);

    useEffect(() => {
        if (!isInSearch) {
            setQuery("");
            setSelected(false);
            ref.current?.blur();
        }
    }, [isInSearch]);

    return <View style={[styles.container, { backgroundColor }, propStyles]}>
        <Feather
            name={(selected || query || isInSearch) ? "x" : "search"}
            size={20}
            color={mutedColor}
            style={{ marginLeft: 1 }}
            onPress={clearSearch}
        />
        <TextInput
            ref={ref}
            placeholder="Search"
            style={{
                color: color,
                flex: 1,
            }}
            value={query}
            onFocus={() => setSelected(true)}
            onBlur={() => setSelected(false)}
            onChangeText={query => setQuery(query)}
            placeholderTextColor={mutedColor}
        />
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 4,
        paddingHorizontal: 10,
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        borderRadius: 18,
    },
});