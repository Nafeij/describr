
import { ThemedText } from '@/components/ThemedText';
import {
  Album,
  Asset,
  getAlbumsAsync,
  getAssetsAsync,
  usePermissions,
} from 'expo-media-library';
import { Link } from 'expo-router';
import { forwardRef, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';


export default function App() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [permissionResponse, requestPermission] = usePermissions();

  useEffect(() => {
    async function getAlbums() {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
      const fetchedAlbums = await getAlbumsAsync({
        includeSmartAlbums: true,
      });
      setAlbums(fetchedAlbums);
    }
    getAlbums();
  }, []);

  return (
    <ScrollView>
      <View style={styles.container}>
        {albums &&
          albums.map((album) => (
            <Link key={album.id} href={`/album/${album.id}`} asChild>
              <AlbumEntry key={album.id} album={album} />
            </Link>
          ))
        }
      </View>
    </ScrollView>
  );
};


const AlbumEntry = forwardRef(function AlbumEntry({ album, ...rest }: { album: Album }, ref: React.ForwardedRef<View>) {
  const [thumbnail, setThumbnail] = useState<Asset | null>(null);

  useEffect(() => {
    async function getThumbnail() {
      const albumThumbnail = await getAssetsAsync({ album, first: 1, sortBy: 'modificationTime' });
      setThumbnail(albumThumbnail.assets[0]);
    }
    getThumbnail();
  }, [album]);

  if (!thumbnail) {
    return null;
  }

  return (
    <Pressable {...rest} style={styles.albumContainer} ref={ref} >
      <Image
        source={{ uri: thumbnail?.uri }}
        style={{ width: "100%", aspectRatio: 1 }}
      />
      <ThemedText type='defaultSemiBold' numberOfLines={1}>
        {album.title}
      </ThemedText>
      <ThemedText type='small' numberOfLines={1} style={{ opacity: 0.7 }}>
        {album.assetCount}
      </ThemedText>
    </Pressable>
  );
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  albumContainer: {
    width: "30%",
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    paddingBottom: 10,
  },
});