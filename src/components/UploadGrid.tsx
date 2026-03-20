import { useCallback, useState } from 'react';
import { loadImageFile } from '../utils';
import type { ImageFile } from '../utils';

interface UploadGridProps {
  images: ImageFile[];
  onImagesAdded: (images: ImageFile[]) => void;
  onImageSelect: (image: ImageFile) => void;
}

export function UploadGrid({ images, onImagesAdded, onImageSelect }: UploadGridProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback(async (files: FileList) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const loaded = await Promise.all(imageFiles.map(loadImageFile));
    onImagesAdded(loaded);
  }, [onImagesAdded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragOver(false), []);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  }, [handleFiles]);

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Fuji Film Filter
          </span>
        </h1>
        <p className="text-zinc-400 text-sm">上传照片，应用经典富士胶片滤镜</p>
      </div>

      {/* Upload Area */}
      <div
        className={`
          w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 mb-8
          ${isDragOver
            ? 'border-amber-400 bg-amber-400/5 scale-[1.02]'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
          }
        `}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="text-5xl mb-4">📷</div>
        <p className="text-zinc-300 font-medium mb-2">
          {isDragOver ? '松开以上传' : '拖拽照片到此处'}
        </p>
        <p className="text-zinc-500 text-sm mb-4">或点击选择文件</p>
        <p className="text-zinc-600 text-xs">支持 JPG、PNG、WebP，可多选</p>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFileInput}
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-zinc-400 text-sm font-medium">
              已上传 {images.length} 张照片
            </h2>
            <button
              onClick={() => document.getElementById('file-input')?.click()}
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              + 添加更多
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map(img => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer
                  bg-zinc-800 hover:ring-2 hover:ring-amber-400/50 transition-all duration-200"
                onClick={() => onImageSelect(img)}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
