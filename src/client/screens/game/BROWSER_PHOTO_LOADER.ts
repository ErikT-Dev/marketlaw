import type { PhotoLoader } from "./PhotoLoader";

export const BROWSER_PHOTO_LOADER: PhotoLoader = {
  decode: async (url) => {
    const image = new Image();
    image.setAttribute("src", url);
    await image.decode();
    return image;
  },
  wait: (milliseconds, then) => {
    const timer = setTimeout(then, milliseconds);
    return () => {
      clearTimeout(timer);
    };
  },
};
