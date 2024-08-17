import TagEditor from "@/components/TagEditor";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { AssetInfo, getAssetInfoAsync } from "expo-media-library";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, useWindowDimensions } from "react-native";
import Gallery from "react-native-awesome-gallery";


export default function ImageView() {
    const { index: _index, from } = useLocalSearchParams<{ index: string, from: "album" | "search" }>();
    const filteredAssetGroup = useFilteredAssetContext();
    const { filtered, getPage } = filteredAssetGroup[from];
    const [index, setIndex] = useState(parseInt(_index));
    const [asset, setAsset] = useState<AssetInfo>();
    const windowDimensions = useWindowDimensions();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const onIndexChange = useCallback((index: number) => {
        setIndex(index);
    }, []);

    useEffect(() => {
        (async () => {
            await getAssetInfoAsync(filtered[index].id).then(setAsset);
            if (index >= filtered.length - 5) {
                await getPage();
            }
        })();
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
                data={filtered.map(({ uri }) => uri)}
                initialIndex={index}
                onIndexChange={onIndexChange}
                containerDimensions={{ width: windowDimensions.width, height: windowDimensions.height - keyboardHeight }}
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
