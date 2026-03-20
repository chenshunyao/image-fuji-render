export interface ImageFile {
  id: string;
  file: File;
  name: string;
  url: string;       // object URL for display
  image: HTMLImageElement;
  width: number;
  height: number;
}

let nextId = 0;

export async function loadImageFile(file: File): Promise<ImageFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        id: `img-${nextId++}`,
        file,
        name: file.name.replace(/\.[^.]+$/, ''),
        url,
        image: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
