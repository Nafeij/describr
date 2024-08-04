import { Album, Asset, getAlbumsAsync, getAssetsAsync } from "expo-media-library";
import { useCallback, useState } from "react";

export type AlbumThumb = Album & { thumbnail: Asset };

export default function useAlbumWithThumbs() {
    const [albums, setAlbums] = useState<AlbumThumb[]>([]);
    const fetchAlbums = useCallback(async () => {
        const fetchedAlbums = await getAlbumsAsync();
        const albumThumbnails = (
            await Promise.all(
                fetchedAlbums.map(async (album) => {
                const albumThumbnail = await getAssetsAsync({
                    album,
                    mediaType: ["photo", "video"],
                });
                return { ...album, thumbnail: albumThumbnail.assets[0] };
                })
            )
        ).filter((album) => album.thumbnail) as AlbumThumb[];
        setAlbums(albumThumbnails);
    }, []);

    return [ albums, fetchAlbums ] as const;
}
