import { Asset } from "expo-media-library";
import { createContext, useContext, useState } from "react";

export function useImageViewStates() {
  const [images, setImages] = useState<Asset[]>();
  const [getPage, setGetPage] = useState<() => void>();
  return { images, setImages, getPage, setGetPage };
}

export const ImageViewContext = createContext<ReturnType<typeof useImageViewStates>>({} as any);

export const ImageViewProvider = ImageViewContext.Provider;

export function useImageViewContext() {
  return useContext(ImageViewContext);
}