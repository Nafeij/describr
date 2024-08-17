import TagEditor from "@/components/TagEditor";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { Params } from "@/lib/consts";
import { AssetInfo, getAssetInfoAsync } from "expo-media-library";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, useWindowDimensions } from "react-native";
import Gallery from "react-native-awesome-gallery";


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
