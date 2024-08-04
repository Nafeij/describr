
import AlbumsList from '@/components/lists/AlbumsList';
import { ThemedView } from '@/components/ThemedView';
import { useAlbumsContext } from '@/hooks/useAlbumWithThumbs';
import { useManagerPermissions } from '@/hooks/useManagerPermissions';
import {
	Album,
	Asset,
	usePermissions
} from 'expo-media-library';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

type AlbumThumb = Album & { thumbnail: Asset };

export default function App() {
	const [refreshing, setRefreshing] = useState(true);
	const [albums, fetchAlbums] = useAlbumsContext();
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
		await fetchAlbums();
		setRefreshing(false);
	}

	const onPress = useCallback((album: AlbumThumb) => {
		router.push({
			pathname: `/album/[id]`, params: {
				id: album.id,
				title: album.title,
				count: album.assetCount
			}
		});
	}, []);

	useEffect(() => {
		getAlbumThumbnails()
	}, []);

	return (
		<ThemedView style={{ flex: 1 }}>
			<AlbumsList
				refreshing={refreshing}
				albums={albums}
				onRefresh={getAlbumThumbnails}
				onPress={onPress}
			/>
		</ThemedView>
	);
};