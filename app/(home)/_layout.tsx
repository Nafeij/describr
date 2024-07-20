import { SearchBar } from '@/components/SearchBar';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeLayout() {
  const [backgroundColor] = useThemeColor({}, ['background']);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <SearchBar />
      <Stack screenOptions={{
        headerShown: false,
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="search" />
      </Stack>
    </SafeAreaView>
  );
}
