import { SearchBar } from '@/components/SearchBar';
import { useFilteredAssetContext } from '@/hooks/useFilteredAssets';
import { useThemeColor } from '@/hooks/useThemeColor';
import { defaultAssetsOptions, Params } from '@/lib/consts';
import { Feather } from '@expo/vector-icons';
import { MediaTypeValue } from 'expo-media-library';
import { Link, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SelectAllButton } from './Selector';
import { ThemedText } from './ThemedText';

const ACTIVE_WIDTHS = {
    MAIN: 36,
    SELECT: 78,
    SELECT_ALL: 92,
    MEDIA: 45,
};

export default function Header() {
    const [color, mutedColor, backgroundColor] = useThemeColor({}, ['text', 'icon', 'field']);
    const { filtered, toggleAll } = useFilteredAssetContext();
    const path = usePathname();
    const router = useRouter();
    const { mediaType: _mediaType } = useGlobalSearchParams<Params>();
    const mediaType = useMemo(() => (
        _mediaType?.includes(',') ? _mediaType.split(',') : _mediaType
    ), [_mediaType]);
    const settingWidth = useSharedValue(0);
    const selectorWidth = useSharedValue(0);
    const mediaWidth = useSharedValue(0);
    const inHome = path === "/" || path.startsWith('/album');
    const inSearch = path === "/search" || path.startsWith('/image');

    const setMedia = (mediaTypeValue: MediaTypeValue) => {
        if (typeof mediaType === 'object') {
            if (mediaType.includes(mediaTypeValue)) {
                if (mediaType.length === 1) return router.setParams({ mediaType: undefined });
                return router.setParams({ mediaType: mediaType.filter(e => e !== mediaTypeValue).join(',') });
            }
            if (mediaType.length + 1 == defaultAssetsOptions.mediaType?.length) {
                return router.setParams({ mediaType: undefined });
            }
        }
        if (!mediaType) return router.setParams({ mediaType: mediaTypeValue });
        if (mediaType === mediaTypeValue) {
            return router.setParams({ mediaType: undefined });
        }
        if (defaultAssetsOptions.mediaType?.length === 2) {
            return router.setParams({ mediaType: mediaTypeValue });
        }
        return router.setParams({ mediaType: [mediaType, mediaTypeValue].join(',') });
    }

    useEffect(() => {
        settingWidth.value = inHome ? ACTIVE_WIDTHS.MAIN : 0;
        mediaWidth.value = inSearch ? ACTIVE_WIDTHS.MEDIA : 0;
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

    const mediaAnimStyle = useAnimatedStyle(() => ({
        top: withTiming(mediaWidth.value),
    }));

    const highlightVideo = mediaType && (mediaType === 'video' || mediaType.includes('video'));
    const highlightPhoto = mediaType && (mediaType === 'photo' || mediaType.includes('photo'));

    return (
        <View style={styles.container}>
            <View style={styles.rowContainer}>
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
            <Animated.View style={[mediaAnimStyle, styles.pill, { backgroundColor: backgroundColor }]}>
                <ThemedText type="default"
                    style={[
                        styles.pillButton,
                        {
                            color: highlightPhoto ? backgroundColor : mutedColor,
                            backgroundColor: highlightPhoto ? mutedColor : "transparent",
                        }
                    ]}
                    onPress={() => setMedia('photo')}
                >
                    Photos
                </ThemedText>
                <View style={
                    [styles.pillDivider, {
                        backgroundColor: mutedColor
                    }]} />
                <ThemedText type="default"
                    style={[
                        styles.pillButton,
                        {
                            color: highlightVideo ? backgroundColor : mutedColor,
                            backgroundColor: highlightVideo ? mutedColor : "transparent",
                        }
                    ]}
                    onPress={() => setMedia('video')}
                >
                    Videos
                </ThemedText>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        margin: 10,
        marginBottom: 6,
        zIndex: 1,
        position: 'relative',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    buttonContainer: {
        position: 'relative',
        alignItems: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    button: {
        position: 'absolute',
        right: 0,
    },
    pill: {
        position: 'absolute',
        borderRadius: 16,
        width: 140,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-evenly',
    },
    pillButton: {
        flex: 1,
        padding: 6,
        textAlign: 'center',
    },
    pillDivider: {
        width: 1,
        marginVertical: 6,
        marginHorizontal: -1,
    },
});
