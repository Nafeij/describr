import { SearchBar } from '@/components/SearchBar';
import { useFilteredAssetContext } from '@/hooks/useFilteredAssets';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Feather } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SelectAllButton } from './Selector';

const ACTIVE_WIDTHS = {
    MAIN: 36,
    SELECT: 78,
    SELECT_ALL: 92,
};

export default function Header() {
    const [color] = useThemeColor({}, ['text']);
    const { filtered, toggleAll } = useFilteredAssetContext();
    const path = usePathname();
    const settingWidth = useSharedValue(0);
    const selectorWidth = useSharedValue(0);

    useEffect(() => {
        settingWidth.value = path.endsWith('search') ? 0 : ACTIVE_WIDTHS.MAIN;
    }, [path]);

    useEffect(() => {
        selectorWidth.value =
            filtered.length && filtered.every(e => e.selected) ? ACTIVE_WIDTHS.SELECT_ALL
                : filtered.some(e => e.selected !== undefined) ? ACTIVE_WIDTHS.SELECT
                    : 0;
    }, [filtered]);

    const settingAnimStyle = useAnimatedStyle(() => ({
        width: withTiming(settingWidth.value),
    }));

    const selectorAnimStyle = useAnimatedStyle(() => ({
        width: withTiming(selectorWidth.value),
    }));

    return (
        <View style={styles.container}>
            <SearchBar styles={{ zIndex: 1 }} />
            <Animated.View style={[selectorAnimStyle, styles.buttonContainer]}>
                <SelectAllButton isAllSelected={filtered.every(e => e.selected)} toggleAll={toggleAll} style={styles.button} />
            </Animated.View>
            <Animated.View style={[settingAnimStyle, styles.buttonContainer]}>
                <Link href="/settings" push style={[styles.button, { marginRight: 6 }]}>
                    <Feather name="settings" size={20} color={color} />
                </Link>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'stretch',
        margin: 12,
        marginBottom: 16,
    },
    buttonContainer: {
        position: 'relative',
        alignItems: 'center',
        // justifyContent: 'flex-end',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    button: {
        position: 'absolute',
        right: 0,
    }
});
