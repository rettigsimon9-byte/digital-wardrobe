export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    img.onerror = reject;
    img.src = url;
  });
}

export function stripBase64Prefix(dataUrl: string): string {
  return dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
}

export function getMediaType(dataUrl: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (dataUrl.startsWith('data:image/png')) return 'image/png';
  if (dataUrl.startsWith('data:image/webp')) return 'image/webp';
  return 'image/jpeg';
}
