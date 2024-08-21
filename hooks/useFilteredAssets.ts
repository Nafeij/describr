import { defaultAssetsOptions, Params } from "@/lib/consts";
import { exifToTags } from "@/lib/utils";
import {
  AssetInfo,
  AssetsOptions,
  getAssetInfoAsync,
  getAssetsAsync
} from "expo-media-library";
import { useGlobalSearchParams } from "expo-router";
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

export function useFilteredAssets() {
  const { query, id, mediaType } = useGlobalSearchParams<Params>();

  const [loading, setLoading] = useState(false);
  const [lastPage, setLastPage] = useState<{
    endCursor: string;
    hasNextPage: boolean;
  }>();
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [filtered, setFiltered, selectorOps] = useSelectorState<AssetInfo>();
  const hasSelected = useMemo(
    () => filtered.some((e) => e.selected !== undefined),
    [filtered]
  );

  const postFilter = useCallback(
    (asset: AssetInfo) => {
      if (!query || asset.filename.toLowerCase().includes(query)) {
        return true;
      }
      // TODO FIX
      // if ( !extractMediaType(query)?.includes(asset.mediaType) ) {
      //   return false;
      // }
      if (
        exifToTags(asset.exif).some((tag) => tag.toLowerCase().includes(query))
      ) {
        return true;
      }
      return false;
    },
    [query]
  );

  const _getPage = useCallback(
    async (refetch?: boolean, signal?: { abort: boolean }) => {
      if (!refetch && lastPage?.hasNextPage === false) {
        return;
      }
      setLoading(true);
      let newAssets: AssetInfo[] = refetch ? [] : assets;
      let cursor = refetch ? undefined : lastPage?.endCursor;
      while (true) {
        const fetchedPage = await getAssetsAsync({
          ...defaultAssetsOptions,
          album: id,
          mediaType: mediaType?.split(",") as AssetsOptions["mediaType"] ?? defaultAssetsOptions.mediaType,
          after: cursor,
        });
        cursor = fetchedPage.endCursor;
        let fetchedAssets: AssetInfo[] = fetchedPage.assets;
        if (query) {
          fetchedAssets = await Promise.all(
            fetchedAssets.map((asset) => getAssetInfoAsync(asset.id))
          );
        }
        newAssets = newAssets.concat(fetchedAssets);
        const newFiltered = newAssets.filter(postFilter);
        if (signal?.abort) {
          return;
        }
        if (fetchedPage.hasNextPage === true && newFiltered.length === 0) {
          continue;
        }
        setLastPage(fetchedPage);
        setAssets(newAssets);
        setFiltered(newFiltered);
        setLoading(false);
        return;
      }
    },
    [loading, lastPage, assets, id, postFilter, query, mediaType]
  );

  const getPage = useCallback(
    (refetch?: boolean) => {
      if (refetch) {
        setLastPage(undefined);
        setAssets([]);
        setFiltered([]);
      }
      const signal = { abort: false };
      _getPage(refetch, signal);
      return () => {
        signal.abort = true;
      };
    },
    [_getPage]
  );

  const clearAll = () => getPage(true);

  useEffect(() => {
    const abortHandle = getPage(true);
    return abortHandle;
  }, [id, mediaType]);

  useEffect(() => {
    if (!query) {
      setFiltered(assets);
      return;
    }
    const filtered = assets.filter(postFilter);
    if (filtered.length > 0 || assets.length == 1) {
      setFiltered(filtered);
      return;
    }
    const abortHandle = getPage(true);
    return abortHandle;
  }, [postFilter]);

  useEffect(() => {
    if (hasSelected) {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        selectorOps.clearSelection();
        return true;
      });
      return () => sub.remove();
    }
  }, [hasSelected]);

  return {
    numAssets: assets.length,
    filtered,
    loading,
    hasSelected,
    getPage,
    clearAll,
    ...selectorOps,
  };
}

export type FilteredAssetsType = ReturnType<typeof useFilteredAssets>;

export const FilteredAssetContext = createContext<FilteredAssetsType>(
  null as any
);

export const FilteredAssetProvider = FilteredAssetContext.Provider;

export function useFilteredAssetContext() {
  return useContext(FilteredAssetContext);
}
