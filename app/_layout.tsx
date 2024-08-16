import { ThemedView } from '@/components/ThemedView';
import useAlbumWithThumbs, { AlbumsContextProvider } from '@/hooks/useAlbumWithThumbs';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FilteredAssetProvider, useFilteredAssets } from '@/hooks/useFilteredAssets';
import { IntentProvider, useIntent } from '@/hooks/useIntentContext';
import { SettingsProvider, useSettings } from '@/hooks/useSettingsContext';
import { exifToTags } from '@/lib/utils';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { AssetInfo } from 'expo-media-library';
import { Stack, useGlobalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const intent = useIntent();
  const settings = useSettings();
  const albums = useAlbumWithThumbs();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { id, query } = useGlobalSearchParams<{ id?: string, query?: string }>();

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

  // const pathname = usePathname();
  // console.log(`pathname [${pathname}]`);
  // console.log(`id [${id}]\t query [${query}]\t from [${from}]\t index [${index}]`);

  const searchAssets = useFilteredAssets({
    preFilters: {
      album: id,
      mediaType: ['photo', 'video'],
      first: 256,
      sortBy: ['modificationTime', 'creationTime'],
    },
    postFilter,
    fetchInfo: true,
  });

  const albumAssets = useFilteredAssets({
    preFilters: {
      album: id,
      mediaType: ['photo', 'video'],
      first: 128,
      sortBy: ['modificationTime', 'creationTime'],
    },
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <IntentProvider value={intent}>
      <SettingsProvider value={settings}>
        <ThemeProvider value={theme}>
          <AlbumsContextProvider value={albums}>
            <FilteredAssetProvider value={{ search: searchAssets, album: albumAssets }}>
              <ThemedView style={{ flex: 1 }}>
                <GestureHandlerRootView>
                  <Stack screenOptions={{
                    headerShown: false,
                  }}>
                    <Stack.Screen name="(home)" />
                    <Stack.Screen name="(displays)" />
                    <Stack.Screen name="settings" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </GestureHandlerRootView>
              </ThemedView>
            </FilteredAssetProvider>
          </AlbumsContextProvider>
        </ThemeProvider>
      </SettingsProvider>
    </IntentProvider >
  );
}
