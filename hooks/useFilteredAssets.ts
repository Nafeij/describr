import { AssetInfo, Asset, getAssetsAsync, getAssetInfoAsync, AssetsOptions } from "expo-media-library";
import { useState, useEffect, useCallback } from "react";
import { useSelectorState } from "./useSelector";

export function useFilteredAssets({
    preFilters,
    postFilter,
    fetchInfo,
}: {
    preFilters: AssetsOptions,
    postFilter?: (_: AssetInfo) => boolean,
    fetchInfo?: boolean
}) {
    const [loading, setLoading] = useState(true);
    const [lastPage, setLastPage] = useState<{
        endCursor: string;
        hasNextPage: boolean;
    }>();
    const [assets, setAssets] = useState<AssetInfo[]>([]);
    const [filtered, setFiltered, selectorOps] = useSelectorState<Asset>();

    const filter = useCallback((newAssets: AssetInfo[]) => {
        if (postFilter) {
            return newAssets.filter(postFilter) as Asset[];
        }
        return newAssets;
    }, [postFilter]);

    const getPage = useCallback(async () => {
        if (loading || lastPage?.hasNextPage === false) return;
        setLoading(true);
        let newAssets: AssetInfo[] = assets;
        let cursor = lastPage?.endCursor;
        while (true) {
            const fetchedPage = (await getAssetsAsync({ ...preFilters, after: cursor }));
            cursor = fetchedPage.endCursor;
            let fetchedAssets: AssetInfo[] = fetchedPage.assets;
            if (fetchInfo) {
                fetchedAssets = await Promise.all(fetchedAssets.map((asset) => getAssetInfoAsync(asset.id)
                ));
            }
            newAssets = newAssets.concat(fetchedAssets);
            const newFiltered = filter(newAssets);
            if (fetchedPage.hasNextPage === false || newFiltered.length > 0) {
                setLastPage(fetchedPage);
                setAssets(newAssets);
                setFiltered(newFiltered);
                break;
            }
        }
        setLoading(false);
    }, [loading, lastPage, assets, preFilters, filter]);

    useEffect(() => {
        setLoading(true);
        (async () => {
            const filtered = filter(assets);
            if (filtered.length > 0 || assets.length < 1) {
                setFiltered(filtered);
                return;
            }
            setFiltered([]);
            await getPage();
        })();
        setLoading(false);
    }, [postFilter]);

    return { assets, filtered, loading, getPage, ...selectorOps };
}