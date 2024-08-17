import { defaultAssetsOptions } from "@/lib/consts";
import { Album, Asset, getAlbumsAsync, getAssetsAsync } from "expo-media-library";
import { createContext, useCallback, useContext, useState } from "react";

export type AlbumThumb = Album & { thumbnail: Asset };

export default function useAlbumWithThumbs() {
    const [albums, setAlbums] = useState<AlbumThumb[]>([]);
    const fetchAlbums = useCallback(async () => {
        const fetchedAlbums = await getAlbumsAsync();
        const albumThumbnails = (
            await Promise.all(
                fetchedAlbums.map(async (album) => {
                const albumThumbnail = await getAssetsAsync({
                    ...defaultAssetsOptions,
                    album,
                    first: 1
                });
                return { ...album, thumbnail: albumThumbnail.assets[0] };
                })
            )
        ).filter((album) => album.thumbnail) as AlbumThumb[];
        setAlbums(albumThumbnails);
    }, []);

    return [ albums, fetchAlbums ] as const;
}

export const AlbumsContext = createContext<ReturnType<typeof useAlbumWithThumbs>>(null as any);

export const AlbumsContextProvider = AlbumsContext.Provider;

export const useAlbumsContext = () => {
    return useContext(AlbumsContext);
};