import { useDebounce } from "@/hooks/useDebounce";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleProp, StyleSheet, TextInput, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

export const SearchBar = ({ styles: propStyles }: { styles?: StyleProp<ViewStyle> }) => {
    const { query: _query } = useLocalSearchParams<{ query: string }>();
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
    const [activeColor, color, backgroundColor] = useThemeColor({}, ['tint', 'icon', 'modal']);

    const clear = () => {
        if (query) {
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

    return <Animated.View style={[styles.container, { backgroundColor }, propStyles]}>
        <Feather
            name={(selected || query || isInSearch) ? "x" : "search"}
            size={20}
            color={color}
            style={{ marginLeft: 1 }}
            onPress={clear}
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
    </Animated.View>
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