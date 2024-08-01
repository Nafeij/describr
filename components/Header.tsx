import { SearchBar } from '@/components/SearchBar';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Feather } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

export default function Header() {
    const [color] = useThemeColor({}, ['text']);
    const path = usePathname();
    const isInSearch = useSharedValue(false);
    const marginRight = useSharedValue(36);
    const derivedMR = useDerivedValue(() =>
        withTiming(marginRight.value * Number(isInSearch.value))
    );

    useEffect(() => {
        isInSearch.value = !path.endsWith('search');
    }, [path]);

    const animStyle = useAnimatedStyle(() => ({
        marginRight: derivedMR.value,
    }));

    return (
        <View style={styles.container}>
            <SearchBar styles={[animStyle, { zIndex: 1 }]} />
            <Link href="/settings" push style={{ position: 'absolute', right: 0, padding: 6 }}>
                <Feather name="settings" size={20} color={color} />
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 12,
        marginBottom: 16,
    },
});
