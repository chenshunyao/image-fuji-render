import { useState, useCallback } from 'react';
import { UploadGrid } from './components/UploadGrid';
import { EditorView } from './components/EditorView';
import type { ImageFile } from './utils';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  const handleImagesAdded = useCallback((newImages: ImageFile[]) => {
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleImageSelect = useCallback((image: ImageFile) => {
    setSelectedImage(image);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedImage(null);
  }, []);

  if (selectedImage) {
    return <EditorView image={selectedImage} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <UploadGrid
        images={images}
        onImagesAdded={handleImagesAdded}
        onImageSelect={handleImageSelect}
      />
    </div>
  );
}

export default App;
