import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Float, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import PhotoOrnaments from './PhotoOrnaments';
import StarTop from './StarTop';
import { TreeState, UploadedImage } from '../types';

interface ExperienceProps {
  treeState: TreeState;
  images: UploadedImage[];
}

const Experience: React.FC<ExperienceProps> = ({ treeState, images }) => {
  return (
    <div className="w-full h-screen relative">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
        
        {/* Centered Position: Tree height is ~14 (-7 to 7). Star adds height. -1 centers the visual mass nicely. */}
        <group position={[0, -1, 0]}>
             {/* Float creates a gentle hovering effect for the whole tree */}
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
                <StarTop treeState={treeState} />
                <Foliage treeState={treeState} />
                <Ornaments treeState={treeState} />
                <PhotoOrnaments treeState={treeState} images={images} />
            </Float>
        </group>

        <ambientLight intensity={0.2} />
        <spotLight 
            position={[10, 15, 10]} 
            angle={0.3} 
            penumbra={1} 
            intensity={2} 
            castShadow 
            shadow-bias={-0.0001}
            color="#ffeeb1"
        />
        <pointLight position={[-5, 5, 5]} intensity={1} color="#00ff88" distance={20} />
        
        <Environment preset="city" />
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.5} radius={0.6} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
        
        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 1.5}
            minDistance={10}
            maxDistance={30}
        />
      </Canvas>
    </div>
  );
};

export default Experience;