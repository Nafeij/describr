import TagEditor from "@/components/TagEditor";
import { useFilteredAssetContext } from "@/hooks/useFilteredAssets";
import { AssetInfo, getAssetInfoAsync } from "expo-media-library";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import Gallery from "react-native-awesome-gallery";


export default function ImageView() {
    const { index, from } = useLocalSearchParams<{ index: string, from: "album" | "search" }>();
    const filteredAssetGroup = useFilteredAssetContext();
    const { filtered, getPage } = filteredAssetGroup[from];
    const [asset, setAsset] = useState<AssetInfo>();

    useEffect(() => {
        getAssetInfoAsync(filtered[parseInt(index)].id).then(setAsset);
    }, []);


    return (
        <>
            <Stack.Screen options={{
                headerTitle: asset?.filename ?? 'Untitled Image',
            }} />
            <Gallery
                data={filtered.map(({ uri }) => uri)}
                initialIndex={parseInt(index)}
                onIndexChange={newIndex => {
                    getAssetInfoAsync(filtered[newIndex].id).then(setAsset);
                    if (newIndex >= filtered.length - 5) {
                        getPage();
                    }
                }}
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

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });