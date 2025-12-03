import React, { useRef } from 'react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, setImages }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: UploadedImage[] = Array.from(e.target.files).map((file: File) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 pointer-events-auto">
      {/* Thumbnail List */}
      <div className="flex gap-2 max-w-md overflow-x-auto pb-2 p-1">
        {images.map(img => (
          <div key={img.id} className="relative group shrink-0">
            <img 
              src={img.url} 
              alt="upload" 
              className="w-16 h-16 object-cover border-2 border-[#D4AF37] rounded-md shadow-md"
            />
            <button
              onClick={() => removeImage(img.id)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Upload Button */}
      <button 
        onClick={() => inputRef.current?.click()}
        className="group relative px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-serif font-bold uppercase tracking-widest text-sm rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] active:scale-95"
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload Decor
        </span>
        <div className="absolute inset-0 bg-white/20 blur-sm group-hover:bg-white/30 transition-colors rounded-sm" />
      </button>
      
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        multiple 
        accept="image/*"
      />
    </div>
  );
};

export default ImageUploader;