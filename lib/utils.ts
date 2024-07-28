export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
    ? RecursivePartial<T[P]>
    : T[P];
};

// https://stackoverflow.com/a/46842181
export const filterAsync = async (
  arr: any[],
  filter: (item: any) => Promise<boolean>
) => {
  const fail = Symbol();
  return (
    await Promise.all(
      arr.map(async (item) => ((await filter(item)) ? item : fail))
    )
  ).filter((i) => i !== fail);
};

export const exifToTags = (exif?: { ImageDescription?: string }) => {
  if (!exif) return [];
  return exif.ImageDescription?.split(",") ?? [];
};

export const cleanTags = (tags: string[]) => {
  return [
    ...new Set(
      tags.map((tag) => tag.trim().replace(/[".\\/]/g, "")).filter(Boolean)
    ),
  ];
};

export const tagsToExif = (tags: string[]) => {
  return { ImageDescription: tags.join(",") };
};

export const isDiffTags = (oldTags: string[], newTags: string[]) => {
  return (
    oldTags.length != newTags.length ||
    oldTags.some((tag) => !newTags.includes(tag))
  );
};
