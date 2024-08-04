import { useDebounce } from "@/hooks/useDebounce";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, StyleProp, StyleSheet, TextInput, View, ViewStyle } from "react-native";

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
    const [color, mutedColor, backgroundColor] = useThemeColor({}, ['text', 'icon', 'field']);

    const handleBack = useCallback(() => {
        if (query || ref.current?.isFocused()) {
            setQuery("");
            ref.current?.blur();
            return true;
        }
        return false;
    }, [query]);

    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", handleBack);
        return () => sub.remove();
    }, [handleBack]);

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
            onPress={() => !handleBack() && router.canGoBack() && router.back()}
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