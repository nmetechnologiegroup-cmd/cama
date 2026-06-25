import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compresses an image file (or base64 string) to keep its size very small (under ~100KB)
 * so it fits safely within localStorage quota limits (usually 5MB).
 */
export function compressImage(
  fileOrBase64: File | string,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImg = (src: string) => {
      // If it's not a base64 data url, resolve immediately
      if (!src.startsWith('data:image/')) {
        resolve(src);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } else {
          resolve(src);
        }
      };
      img.onerror = (e) => {
        // Fall back to original on error
        resolve(src);
      };
    };

    if (fileOrBase64 instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          processImg(e.target.result as string);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(fileOrBase64);
    } else {
      processImg(fileOrBase64);
    }
  });
}
