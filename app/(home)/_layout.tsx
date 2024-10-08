import Header from '@/components/Header';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeLayout() {
  const [backgroundColor] = useThemeColor({}, ['background']);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <Header />
      <Stack screenOptions={{
        headerShown: false,
      }} />
    </SafeAreaView>
  );
}
