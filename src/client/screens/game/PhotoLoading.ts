import { createContext } from "react";
import { BROWSER_PHOTO_LOADER } from "./BROWSER_PHOTO_LOADER";
import type { PhotoLoader } from "./PhotoLoader";

export const PhotoLoading = createContext<PhotoLoader>(BROWSER_PHOTO_LOADER);
