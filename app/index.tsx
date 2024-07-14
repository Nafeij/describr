
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useEffect, useState } from 'react';
import { AlbumEntry } from '@/components/AlbumEntry';


export default function Home() {
  const [albums, setAlbums] = useState<MediaLibrary.Album[] | null>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    async function getAlbums() {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
      const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });
      setAlbums(fetchedAlbums);
    }
    getAlbums();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {albums ? (
          albums.map((album) => (
            <Link key={album.id} href={`/album/${album.id}`}>
              <AlbumEntry album={album} />
            </Link>
          ))
        ) : (
          <ThemedText>Loading...</ThemedText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});