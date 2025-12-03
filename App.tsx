import React, { useState, Suspense } from 'react';
import Experience from './components/Experience';
import HandTracker from './components/HandTracker';
import ImageUploader from './components/ImageUploader';
import { TreeState, UploadedImage } from './types';

function App() {
  const [treeState, setTreeState] = useState<TreeState>('FORMED');
  const [images, setImages] = useState<UploadedImage[]>([]);

  return (
    <div className="relative w-full h-screen bg-[#000c05] overflow-hidden font-sans">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000c05] via-[#011c0d] to-[#000c05] pointer-events-none" />

      {/* Main 3D Experience */}
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-[#D4AF37] font-serif tracking-[0.3em]">INITIALIZING LUXURY...</div>}>
        <Experience treeState={treeState} images={images} />
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 p-8 z-10 pointer-events-none">
        <h1 className="text-5xl font-serif text-[#D4AF37] drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)] tracking-tighter">
          The Grand Tree
        </h1>
        <p className="text-[#a8bfae] mt-2 font-light tracking-widest text-xs uppercase border-l-2 border-[#D4AF37] pl-3">
          Interactive Holiday Experience
        </p>
        <div className="mt-8">
            <p className="text-xs text-[#D4AF37] opacity-70 mb-1 font-mono">CURRENT STATE</p>
            <div className={`text-2xl font-bold tracking-widest transition-colors duration-500 ${treeState === 'CHAOS' ? 'text-red-500 blur-[0.5px]' : 'text-emerald-400'}`}>
                {treeState}
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-8 z-10 pointer-events-none max-w-sm">
        <p className="text-white/40 text-[10px] uppercase tracking-wider leading-relaxed">
            Open your hand to scatter the tree.<br/>
            Close your fist to restore order.<br/>
            Experience the gold standard of holidays.
        </p>
      </div>

      {/* Interactive Components */}
      <HandTracker onStateChange={setTreeState} />
      <ImageUploader images={images} setImages={setImages} />
    </div>
  );
}

export default App;