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
  // return exif.ImageDescription?.replace(/["]/g,"").split(",") ?? [];
  return exif.ImageDescription?.split(",").map(item => item.trim()) ?? [];
};

export const tagsToExif = (tags: string[]) => {
  return { ImageDescription: tags.join(",") };
};
