import { Asset, AssetInfo, AssetsOptions, getAssetInfoAsync, getAssetsAsync } from "expo-media-library";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
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
        const filtered = filter(assets);
		if (filtered.length > 0 || assets.length < 1) {
			setFiltered(filtered);
			setLoading(false);
			return;
		}
		setFiltered([]);
		getPage().then(() => setLoading(false));
    }, [postFilter]);

    return { assets, filtered, loading, getPage, ...selectorOps };
}

export const FilteredAssetContext = createContext<ReturnType<typeof useFilteredAssets>>(null as any);

export const FilteredAssetProvider = FilteredAssetContext.Provider;

export function useFilteredAssetContext() {
    return useContext(FilteredAssetContext);
}