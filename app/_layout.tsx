import { ThemedView } from '@/components/ThemedView';
import useAlbumWithThumbs, { AlbumsContextProvider } from '@/hooks/useAlbumWithThumbs';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IntentProvider, useIntent } from '@/hooks/useIntentContext';
import { SettingsProvider, useSettings } from '@/hooks/useSettingsContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
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
          </AlbumsContextProvider>
        </ThemeProvider>
      </SettingsProvider>
    </IntentProvider >
  );
}
