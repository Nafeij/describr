import Header from '@/components/Header';
import { FilteredAssetProvider, useFilteredAssets } from '@/hooks/useFilteredAssets';
import { useThemeColor } from '@/hooks/useThemeColor';
import { exifToTags } from '@/lib/utils';
import { AssetInfo } from 'expo-media-library';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeLayout() {
  const [backgroundColor] = useThemeColor({}, ['background']);
  const { id, query } = useGlobalSearchParams<{ id?: string, query: string }>();

  const postFilter = useCallback((asset: AssetInfo) => {
    if (!query
      || asset.filename.toLowerCase().includes(query)
    ) {
      return true;
    }
    if (exifToTags(asset.exif).some(tag => tag.toLowerCase().includes(query))) {
      return true;
    }
    return false;
  }, [query]);


  const filteredAssets = useFilteredAssets({
    preFilters: {
      album: id,
      mediaType: ['photo', 'video'],
      first: 256,
      sortBy: ['modificationTime', 'creationTime'],
    },
    postFilter,
    fetchInfo: true,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <FilteredAssetProvider value={filteredAssets}>
        <Header />
        <Stack screenOptions={{
          headerShown: false,
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="search" />
        </Stack>
      </FilteredAssetProvider>
    </SafeAreaView>
  );
}
