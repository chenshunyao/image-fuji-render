import { useEffect, useRef, useState, useCallback } from 'react';
import type { FilterParams } from '../filters';
import { filters } from '../filters';
import { FilterRenderer } from '../renderer';
import type { ImageFile } from '../utils';
import { downloadBlob } from '../utils';

interface EditorViewProps {
  image: ImageFile;
  onBack: () => void;
}

export function EditorView({ image, onBack }: EditorViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<FilterRenderer | null>(null);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const thumbnailRendererRef = useRef<FilterRenderer | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterParams>(filters[0]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize renderers
  useEffect(() => {
    if (!canvasRef.current) return;

    // Main renderer
    const canvas = canvasRef.current;
    // Limit display size for performance but keep aspect ratio
    const maxDisplayWidth = Math.min(image.width, window.innerWidth * (window.devicePixelRatio || 1));
    const scale = maxDisplayWidth / image.width;
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const renderer = new FilterRenderer(canvas);
    renderer.setImage(image.image);
    rendererRef.current = renderer;

    // Thumbnail renderer (small hidden canvas)
    const thumbCanvas = document.createElement('canvas');
    const thumbSize = 80;
    const thumbScale = thumbSize / Math.max(image.width, image.height);
    thumbCanvas.width = Math.round(image.width * thumbScale);
    thumbCanvas.height = Math.round(image.height * thumbScale);
    thumbnailCanvasRef.current = thumbCanvas;

    const thumbRenderer = new FilterRenderer(thumbCanvas);
    thumbRenderer.setImage(image.image);
    thumbnailRendererRef.current = thumbRenderer;

    // Generate thumbnails for all filters
    const thumbs = new Map<string, string>();
    for (const f of filters) {
      thumbRenderer.render(f);
      thumbs.set(f.id, thumbCanvas.toDataURL('image/jpeg', 0.6));
    }
    setThumbnails(thumbs);

    // Render initial
    renderer.render(filters[0]);

    return () => {
      renderer.destroy();
      thumbRenderer.destroy();
    };
  }, [image]);

  // Re-render on filter change
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    if (showOriginal) {
      renderer.render(filters[0]); // Original
    } else {
      renderer.render(selectedFilter);
    }
  }, [selectedFilter, showOriginal]);

  const handleDownload = useCallback(async () => {
    if (!image || selectedFilter.id === 'original') return;
    setDownloading(true);
    try {
      // Create a full-resolution canvas for download
      const dlCanvas = document.createElement('canvas');
      dlCanvas.width = image.width;
      dlCanvas.height = image.height;
      const dlRenderer = new FilterRenderer(dlCanvas);
      dlRenderer.setImage(image.image);
      dlRenderer.render(selectedFilter);
      const blob = await dlRenderer.toBlob(0.95);
      downloadBlob(blob, `${image.name}_${selectedFilter.name}.jpg`);
      dlRenderer.destroy();
    } catch (e) {
      console.error('Download failed:', e);
    }
    setDownloading(false);
  }, [image, selectedFilter]);

  const handleMouseDown = useCallback(() => setShowOriginal(true), []);
  const handleMouseUp = useCallback(() => setShowOriginal(false), []);

  // Scroll filter bar with wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <span className="text-lg">←</span>
          <span className="text-sm">返回</span>
        </button>
        <div className="text-center">
          <span className="text-sm text-zinc-300 font-medium">{image.name}</span>
          {selectedFilter.id !== 'original' && (
            <span className="ml-2 text-xs text-amber-400">· {selectedFilter.name}</span>
          )}
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading || selectedFilter.id === 'original'}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
            ${selectedFilter.id === 'original'
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-black'
            }`}
        >
          {downloading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>↓</span>
          )}
          下载
        </button>
      </div>

      {/* Main preview area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden bg-zinc-950 relative select-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setShowOriginal(false)}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: 'auto' }}
        />
        {showOriginal && selectedFilter.id !== 'original' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs text-zinc-300">原图</span>
          </div>
        )}
        {!showOriginal && selectedFilter.id !== 'original' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-zinc-500">
            按住查看原图
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-800 py-3 px-2">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 px-2 scroll-smooth"
          onWheel={handleWheel}
          style={{ scrollbarWidth: 'thin' }}
        >
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all duration-200
                ${selectedFilter.id === filter.id
                  ? 'bg-amber-500/20 ring-2 ring-amber-400'
                  : 'bg-zinc-800/50 hover:bg-zinc-700/50'
                }`}
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden bg-zinc-700">
                {thumbnails.get(filter.id) ? (
                  <img
                    src={thumbnails.get(filter.id)}
                    alt={filter.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full animate-pulse bg-zinc-600" />
                )}
              </div>
              <span className={`text-[10px] sm:text-xs whitespace-nowrap font-medium
                ${selectedFilter.id === filter.id ? 'text-amber-400' : 'text-zinc-400'}`}>
                {filter.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
