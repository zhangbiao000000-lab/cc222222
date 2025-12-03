import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeState } from '../types';
import { randomSpherePoint } from '../utils/math';

interface StarTopProps {
  treeState: TreeState;
}

const StarTop: React.FC<StarTopProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  const { shape, targetPos, chaosPos } = useMemo(() => {
    const s = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.6;
    
    // Draw star logic
    s.moveTo(0, outerRadius);
    for (let i = 1; i <= points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        s.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
    }
    s.closePath();

    // Center geometry roughly by offsetting, though Shape is centered at 0,0 
    // Extrude usually starts z at 0. We can center it later or via props.
    
    // Target: Top of tree (tree height ~14, centered at 0, top is 7).
    const tPos = new THREE.Vector3(0, 7.8, 0);
    
    // Chaos: Random position high up
    const [cx, cy, cz] = randomSpherePoint(20);
    const cPos = new THREE.Vector3(cx, cy + 8, cz);

    return { shape: s, targetPos: tPos, chaosPos: cPos };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    
    // State interpolation
    const target = treeState === 'CHAOS' ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, delta * 2.0);

    // Position Interp
    meshRef.current.position.lerpVectors(targetPos, chaosPos, progressRef.current);

    // Rotation
    const time = clock.getElapsedTime();
    // Spin gently in Formed state
    meshRef.current.rotation.y = time * 0.8; 
    
    // Chaos rotation override
    if (progressRef.current > 0.01) {
       // Add erratic rotation based on progress
       meshRef.current.rotation.x = Math.sin(time * 3) * progressRef.current;
       meshRef.current.rotation.z = Math.cos(time * 2) * progressRef.current;
    } else {
       // Reset tilt when formed
       meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 5);
       meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 5);
    }
    
    // Scale pulse
    const scale = 1 + Math.sin(time * 2) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  const extrudeSettings = {
    steps: 1,
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.05,
    bevelSegments: 3
  };

  return (
    <group ref={meshRef}>
      <mesh>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial 
            color="#FFD700" 
            emissive="#FFD700"
            emissiveIntensity={0.8}
            metalness={1} 
            roughness={0.15} 
            clearcoat={1}
        />
      </mesh>
      {/* Glow Effect Light */}
      <pointLight distance={8} intensity={3} color="#FFD700" decay={2} />
    </group>
  );
};

export default StarTop;