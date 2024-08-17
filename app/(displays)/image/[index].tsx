import TagEditor from "@/components/TagEditor";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { Params } from "@/lib/consts";
import { Feather } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { AssetInfo, getAssetInfoAsync } from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useState } from "react";
import { Keyboard, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Gallery, { RenderItemInfo } from "react-native-awesome-gallery";

type Data = { id: string, uri: string, index: number };

export default function ImageView() {
    const params = useLocalSearchParams<Params>();
    const index = parseInt(params.index ?? '0');
    const router = useRouter();
    const { filtered, getPage } = useFilteredAssetContext();
    const [asset, setAsset] = useState<AssetInfo>();
    const windowDimensions = useWindowDimensions();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const onIndexChange = useCallback((index: number) => {
        router.setParams({ index: index.toString() });
        // router.setParams({ ...params, index: index.toString() });
    }, []);

    useEffect(() => {
        let active = true;
        const fetchAsset = async () => {
            const info = await getAssetInfoAsync(filtered[index].id);
            if (!active) return;
            setAsset(info);
            if (index >= filtered.length - 5) {
                getPage();
            }
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
                headerTitle: asset?.filename ?? 'Untitled Image',
            }} />
            <Gallery
                data={filtered.map(({ id, uri, mediaType }, index) => ({ id, uri, mediaType, index }))}
                initialIndex={index}
                onIndexChange={onIndexChange}
                containerDimensions={{ width: windowDimensions.width, height: windowDimensions.height - keyboardHeight - useHeaderHeight() }}
                renderItem={params => (
                    params.item.mediaType === 'video'
                        ? renderVideo({
                            initialPlaying: params.index === index,
                            ...params
                        })
                        : defaultRenderImage(params)
                )}
                pinchEnabled={asset?.mediaType !== 'video'}
                doubleTapEnabled={asset?.mediaType !== 'video'}
                disableVerticalSwipe={asset?.mediaType === 'video'}
            />
            {
                asset &&
                <TagEditor
                    asset={asset}
                />
            }
        </>
    );
}

const defaultRenderImage = ({
    item,
    setImageDimensions,
}: RenderItemInfo<Data>) => {
    return (
        <Image
            key={item.id}
            contentFit="contain"
            source={{ uri: item.uri }}
            style={StyleSheet.absoluteFillObject}
            onLoad={(e) => {
                const { height: h, width: w } = e.source;
                setImageDimensions({ height: h, width: w });
            }}
        />
    );
};

const renderVideo = ({
    initialPlaying,
    item,
    setImageDimensions,
}: { initialPlaying: boolean }
    & RenderItemInfo<Data>
) => {
    const [isPlaying, setIsPlaying] = useState(initialPlaying);
    const [isMuted, setIsMuted] = useState(true);
    const player = useVideoPlayer(item, player => {
        player.loop = true;
        player.muted = isMuted;
    });

    useEffect(() => {
        setIsPlaying(initialPlaying);
        if (initialPlaying) {
            player.play();
            return;
        }
        player.replay();
        player.pause();
    }, [initialPlaying]);

    return (
        <>
            <VideoView
                player={player}
                style={StyleSheet.absoluteFillObject}
                nativeControls={false}
                contentFit="contain"
            />
            <Pressable
                key={item.id}
                style={[
                    StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}
                onPress={() => {
                    isPlaying ? player.pause() : player.play();
                    // console.log('play');
                    setIsPlaying(!isPlaying);
                }}
                onLayout={(e) => {
                    const { height: h, width: w } = e.nativeEvent.layout;
                    setImageDimensions({ height: h, width: w });
                }}
            />
            <Pressable
                style={styles.mute}
                onPress={() => {
                    player.muted = !isMuted;
                    setIsMuted(!isMuted);
                }}
            >
                <Feather
                    name={isMuted ? 'volume-x' : 'volume-2'}
                    size={24}
                    color="white"
                />
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    mute: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 12,
    }
});