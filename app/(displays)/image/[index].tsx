import TagEditor from "@/components/TagEditor";
import { ThemedText } from "@/components/ThemedText";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Params } from "@/lib/consts";
import { Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { Asset, AssetInfo, getAssetInfoAsync } from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import Gallery, { RenderItemInfo } from "react-native-awesome-gallery";

export default function ImageView() {
    const params = useLocalSearchParams<Params>();
    const index = parseInt(params.index ?? '0');
    const router = useRouter();
    const { filtered, getPage } = useFilteredAssetContext();
    const [asset, setAsset] = useState<AssetInfo>();
    const windowDimensions = useWindowDimensions();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const headerHeight = useHeaderHeight();
    const [muted] = useThemeColor({}, ['icon']);

    const onIndexChange = useCallback((index: number) => {
        router.setParams({ index: index.toString() });
    }, []);

    useEffect(() => {
        if (index >= filtered.length - 5) {
            getPage();
        }
        if (filtered[index].exif !== undefined) {
            setAsset(filtered[index]);
            return;
        }
        let active = true;
        const fetchAsset = async () => {
            const info = await getAssetInfoAsync(filtered[index].id);
            if (!active) return;
            setAsset(info);
        }
        fetchAsset();
        return () => {
            active = false;
        };
    }, [index]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardHeight(0)
        );
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return (
        <>
            <Stack.Screen options={{
                headerTitle: () => (
                    <View style={{ flex: 1, overflow: 'hidden', paddingRight: 100 }}>
                        <ThemedText type="title">{`${index + 1} of ${filtered.length}`}</ThemedText>
                        <ScrollView horizontal={true}>
                            <ThemedText
                                type="default"
                                style={{
                                    color: muted,
                                }}
                                numberOfLines={1}
                            >
                                {asset?.filename ?? 'Untitled Image'}
                            </ThemedText>
                        </ScrollView>
                    </View>
                ),
            }} />

            <Gallery
                data={filtered}
                initialIndex={index}
                onIndexChange={onIndexChange}
                containerDimensions={{ width: windowDimensions.width, height: windowDimensions.height - keyboardHeight - headerHeight }}
                renderItem={(info) => <Media {...info} isFocused={index === info.index} />}
                pinchEnabled={asset?.mediaType !== 'video'}
                doubleTapEnabled={asset?.mediaType !== 'video'}
                disableVerticalSwipe={asset?.mediaType === 'video'}
                style={{ backgroundColor: 'transparent' }}
            />
            {
                asset?.mediaType === 'photo' && <TagEditor asset={asset} />
            }
        </>
    );
}

const Media = ({
    item,
    setImageDimensions,
    isFocused
}: { isFocused: boolean } &
    Pick<RenderItemInfo<Asset>, "item" | "setImageDimensions">
) => {
    if (item.mediaType === 'video') return (
        <Video
            item={item}
            isFocused={isFocused}
            setImageDimensions={setImageDimensions}
        />
    );
    return (<Image
        key={item.id}
        contentFit="contain"
        source={{ uri: item.uri }}
        style={StyleSheet.absoluteFillObject}
        onLoad={(e) => {
            const { height: h, width: w } = e.source;
            setImageDimensions({ height: h, width: w });
        }}
    />);
}
const Video = ({
    item,
    setImageDimensions,
    isFocused
}: { isFocused: boolean } &
    Pick<RenderItemInfo<Asset>, "item" | "setImageDimensions">
) => {
    const once = useRef(false);
    const [isMuted, setIsMuted] = useState(true);
    const player = useVideoPlayer(item, player => {
        player.loop = true;
    });

    useEffect(() => {
        player.pause();
        player.muted = true;
        setIsMuted(true);
    }, [isFocused]);

    return (
        <>
            <VideoView
                player={player}
                style={StyleSheet.absoluteFillObject}
                contentFit="contain"
                nativeControls={false}
                onLayout={(e) => {
                    if (once.current) return;
                    once.current = true;
                    const { height: h, width: w } = e.nativeEvent.layout;
                    setImageDimensions({ height: h, width: w });
                }}
            />
            <Pressable
                key={item.id}
                style={[
                    StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}
                onPress={() => {
                    player.playing ? player.pause() : player.play();
                }}
            />
            <Feather
                name={isMuted ? 'volume-x' : 'volume-2'}
                size={24}
                style={styles.mute}
                color="white"
                onPress={(e) => {
                    e.stopPropagation();
                    player.muted = !isMuted;
                    setIsMuted(!isMuted);
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    mute: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 16,
    }
});