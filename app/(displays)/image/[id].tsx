import TagEditor from "@/components/TagEditor";
import { ThemedView } from "@/components/ThemedView";
import { useImageViewContext } from "@/hooks/useImageViewStates";
import { AssetInfo, getAssetInfoAsync } from "expo-media-library";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";


export default function ImageView() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [asset, setAsset] = useState<AssetInfo>();
    const { images, getPage } = useImageViewContext();

    console.log(images?.[0]?.uri ?? 'no first image');

    useEffect(() => {
        if (!id) return;
        getAssetInfoAsync(id).then(setAsset);
    }, [id]);

    const scale = useSharedValue({ start: 1, current: 1 });
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const drag = Gesture.Pan()
        .averageTouches(true)
        .onChange(({ changeX, changeY }) => {
            translateX.value += changeX;
            translateY.value += changeY;
        });

    const zoom = Gesture.Pinch()
        .onUpdate(({ scale: newScale }) => {
            scale.value.current = scale.value.start * newScale;
        })
        .onEnd(() => {
            if (scale.value.current < 1) {
                scale.value.current = 1;
            }
            scale.value.start = scale.value.current;
        });

    const tap = Gesture.Tap().numberOfTaps(2)
        .onEnd(() => {
            scale.value.start = 1;
            scale.value.current = 1;
            translateX.value = 0;
            translateY.value = 0;
        });

    const composed = Gesture.Exclusive(Gesture.Simultaneous(drag, zoom), tap);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value.current },
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    if (!asset) return null;

    return (
        <ThemedView style={{ flex: 1, position: 'relative' }}>
            <Stack.Screen options={{
                headerTitle: asset?.filename ?? 'Untitled Image',
            }} />

            <GestureDetector gesture={composed}>
                <View style={styles.container}>
                    <Animated.Image source={{ uri: asset?.uri }} style={[
                        {
                            width: '100%',
                            aspectRatio: asset ? asset.width / asset.height : 1,
                        },
                        animatedStyle,
                    ]} />
                </View>
            </GestureDetector>
            <TagEditor asset={asset} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});