import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/useThemeColor';

export default function AlbumLayout() {
  const [color, backgroundColor] = useThemeColor({}, ['text', 'background']);
  return (
    <Stack screenOptions={{
      headerShown: true,
      headerTintColor: color,
      headerStyle: {
        backgroundColor,
      },
    }}>
      <Stack.Screen name="album/[id]" />
      <Stack.Screen name="image/[img_id]" />
    </Stack>
  );
}
