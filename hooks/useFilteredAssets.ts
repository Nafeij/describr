import {
  Asset,
  AssetInfo,
  AssetsOptions,
  getAssetInfoAsync,
  getAssetsAsync,
} from "expo-media-library";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BackHandler } from "react-native";
import { useSelectorState } from "./useSelector";

export function useFilteredAssets({
  preFilters,
  postFilter,
  fetchInfo,
}: {
  preFilters: AssetsOptions;
  postFilter?: (_: AssetInfo) => boolean;
  fetchInfo?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [lastPage, setLastPage] = useState<{
    endCursor: string;
    hasNextPage: boolean;
  }>();
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [filtered, setFiltered, selectorOps] = useSelectorState<Asset>();
  const [refetchFlag, setRefetchFlag] = useState(false);
  const hasSelected = useMemo(() => filtered.some((e) => e.selected !== undefined), [filtered]);

  const filter = useCallback(
    (newAssets: AssetInfo[]) => {
      if (postFilter) {
        return newAssets.filter(postFilter) as Asset[];
      }
      return newAssets;
    },
    [postFilter]
  );

  const getPage = useCallback(async () => {
    if (loading || lastPage?.hasNextPage === false) {
      return;
    }
    setLoading(true);
    let newAssets: AssetInfo[] = assets;
    let cursor = lastPage?.endCursor;
    while (true) {
      const fetchedPage = await getAssetsAsync({
        ...preFilters,
        after: cursor,
      });
      cursor = fetchedPage.endCursor;
      let fetchedAssets: AssetInfo[] = fetchedPage.assets;
      if (fetchInfo) {
        fetchedAssets = await Promise.all(
          fetchedAssets.map((asset) => getAssetInfoAsync(asset.id))
        );
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

  const clearAll = useCallback(() => {
    if (loading) {
      return;
    }
    setLastPage(undefined);
    setAssets([]);
    setFiltered([]);
    setRefetchFlag(true);
  }, [loading]);

  useEffect(() => {
    const filtered = filter(assets);
    if (filtered.length > 0 || assets.length < 1) {
      setFiltered(filtered);
      return;
    }
    setFiltered([]);
    getPage();
  }, [postFilter]);

  useEffect(() => {
    clearAll();
  }, [preFilters.album]);

  useEffect(() => {
    if (refetchFlag) {
      setRefetchFlag(false);
      getPage();
    }
  }, [refetchFlag]);

  useEffect(() => {
    if (hasSelected) {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        selectorOps.clearSelection();
        return true;
      });
      return () => sub.remove();
    }
  }, [hasSelected]);

  return { assets, filtered, loading, getPage, clearAll, ...selectorOps };
}

export type FilteredAssetsType = ReturnType<typeof useFilteredAssets>;

export const FilteredAssetContext = createContext<{
  search: FilteredAssetsType;
  album: FilteredAssetsType;
}>(null as any);

export const FilteredAssetProvider = FilteredAssetContext.Provider;

export function useFilteredAssetContext() {
  return useContext(FilteredAssetContext);
}
