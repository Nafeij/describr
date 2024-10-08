import { AssetsOptions, MediaTypeValue } from "expo-media-library";

export const defaultAssetsOptions = {
  mediaType: ["photo", "video"],
  sortBy: ["modificationTime", "creationTime"],
  first: 256,
} as AssetsOptions;

export type Params = {
  id?: string;
  query?: string;
  mediaType?: string;

  index?: string;

  title?: string;
  count?: string;
};
