
import { ThemedRefreshControl } from '@/components/ThemedRefreshControls';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useManagerPermissions } from '@/hooks/useManagerPermissions';
import { FlashList } from "@shopify/flash-list";
import { Image } from 'expo-image';
import {
  Album,
  Asset,
  getAlbumsAsync,
  getAssetsAsync,
  usePermissions,
} from 'expo-media-library';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet
} from 'react-native';

type AlbumThumb = Album & { thumbnail: Asset };

export default function App() {
  const [refreshing, setRefreshing] = useState(true);
  const [albums, setAlbums] = useState<AlbumThumb[]>([]);
  const [mediaPermission, requestMediaPerm] = usePermissions();
  const [managerPermission, requestManagerPerm] = useManagerPermissions();

  const getAlbumThumbnails = async () => {
    setRefreshing(true);
    if (mediaPermission?.status !== 'granted') {
      await requestMediaPerm();
    }
    if (managerPermission?.status !== 'granted') {
      await requestManagerPerm();
    }
    const fetchedAlbums = await getAlbumsAsync();
    const albumThumbnails = (await Promise.all(
      fetchedAlbums.map(async (album) => {
        const albumThumbnail = await getAssetsAsync({ album, mediaType: ["photo", "video"] });
        return { ...album, thumbnail: albumThumbnail.assets[0] };
      })
    )).filter((album) => album.thumbnail) as AlbumThumb[];
    setAlbums(albumThumbnails);
    setRefreshing(false);
  }

  useEffect(() => {
    getAlbumThumbnails()
  }, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlashList
        data={albums}
        renderItem={({ item }) => <AlbumEntry album={item} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        estimatedItemSize={50}
        refreshControl={
          <ThemedRefreshControl refreshing={refreshing} onRefresh={getAlbumThumbnails} />
        }
      />
    </ThemedView>
  );
};


const AlbumEntry = ({ album }: { album: AlbumThumb }) => {
  return (
    <Link
      key={album.id}
      href={{ pathname: `/album/[id]`, params: { id: album.id, title: album.title, count: album.assetCount } }}
      style={styles.albumContainer}
    >
      <Image
        source={{ uri: album.thumbnail?.uri }}
        style={{ width: "100%", aspectRatio: 1 }}
        autoplay={false}
      />
      <ThemedText type='defaultSemiBold' numberOfLines={1}>
        {album.title}
      </ThemedText>
      <ThemedText type='small' numberOfLines={1} style={{ opacity: 0.7 }}>
        {album.assetCount}
      </ThemedText>
    </Link >
  );
}

const styles = StyleSheet.create({
  albumContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    paddingBottom: 10,
    paddingHorizontal: 3,
  },
});