import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { randomConePoint, randomSpherePoint } from '../utils/math';
import { TreeState, UploadedImage } from '../types';

const PhotoFrame: React.FC<{ url: string; treeState: TreeState }> = ({ url, treeState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture(url);
  const progressRef = useRef(0);

  const { targetPos, chaosPos, rotationSpeed, wobbleOffset } = useMemo(() => {
    // Generate position on the cone surface
    // height 14, radius 6.5 (slightly outside foliage)
    const [tx, ty, tz] = randomConePoint(14, 6.5); 
    
    // Chaos position in sphere radius 25
    const [cx, cy, cz] = randomSpherePoint(25);

    return {
      targetPos: new THREE.Vector3(tx, ty, tz),
      chaosPos: new THREE.Vector3(cx, cy + 6, cz),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      ),
      wobbleOffset: Math.random() * Math.PI * 2
    };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    const target = treeState === 'CHAOS' ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, delta * 2);
    
    // Position
    groupRef.current.position.lerpVectors(targetPos, chaosPos, progressRef.current);
    
    // Animation
    if (progressRef.current > 0.05) {
       // Chaos: Spin wildly
       groupRef.current.rotation.x += rotationSpeed.x * delta;
       groupRef.current.rotation.y += rotationSpeed.y * delta;
       groupRef.current.rotation.z += rotationSpeed.z * delta;
    } else {
       // Formed: Face outward from center
       // Calculate vector from center (y-axis) to object
       // The default plane faces +Z. lookAt points +Z to target.
       // We want the back to face the tree center (0, y, 0).
       
       const lookAtTarget = new THREE.Vector3(0, groupRef.current.position.y, 0);
       groupRef.current.lookAt(lookAtTarget);
       // Flip 180 deg to face outward
       groupRef.current.rotateY(Math.PI);
       
       // Add gentle floating wobble
       const time = clock.getElapsedTime();
       groupRef.current.rotation.z = Math.sin(time * 1.5 + wobbleOffset) * 0.05;
       groupRef.current.rotation.x = Math.cos(time * 1.2 + wobbleOffset) * 0.05;
    }
    
    // Scale down in Chaos to mimic distance/perspective variance
    const scale = THREE.MathUtils.lerp(1, 0.6, progressRef.current);
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      {/* Gold Frame Box */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[1.2, 1.2, 0.1]} />
        <meshPhysicalMaterial 
            color="#FFD700" 
            metalness={1} 
            roughness={0.2} 
            clearcoat={1}
        />
      </mesh>
      
      {/* Photo Plane */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
};

const PhotoOrnaments: React.FC<{ treeState: TreeState; images: UploadedImage[] }> = ({ treeState, images }) => {
  return (
    <group>
      {images.map((img) => (
        <React.Suspense key={img.id} fallback={null}>
          <PhotoFrame url={img.url} treeState={treeState} />
        </React.Suspense>
      ))}
    </group>
  );
};

export default PhotoOrnaments;