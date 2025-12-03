import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { conePoints, randomSpherePoint } from '../utils/math';
import { OrnamentData, TreeState } from '../types';

interface OrnamentsProps {
  treeState: TreeState;
}

const tempObj = new THREE.Object3D();
const colorPalette = ['#FFD700', '#B22222', '#F0F8FF', '#D4AF37']; 

const Ornaments: React.FC<OrnamentsProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const progressRef = useRef(0);
  const count = 350;

  const ornaments = useMemo<OrnamentData[]>(() => {
    const data: OrnamentData[] = [];
    const targetRaw = conePoints(count, 14, 6.2);

    for (let i = 0; i < count; i++) {
      const chaos = randomSpherePoint(25);
      data.push({
        id: i,
        type: 'ball',
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        chaosPos: [chaos[0], chaos[1] + 6, chaos[2]],
        targetPos: [targetRaw[i * 3], targetRaw[i * 3 + 1], targetRaw[i * 3 + 2]],
        scale: Math.random() * 0.4 + 0.1,
        rotationSpeed: [Math.random(), Math.random(), Math.random()]
      });
    }
    return data;
  }, []);

  useLayoutEffect(() => {
    if (meshRef.current) {
      ornaments.forEach((data, i) => {
        tempObj.position.set(...data.targetPos);
        tempObj.scale.setScalar(data.scale);
        tempObj.updateMatrix();
        meshRef.current?.setColorAt(i, new THREE.Color(data.color));
        meshRef.current?.setMatrixAt(i, tempObj.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [ornaments]);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    
    const target = treeState === 'CHAOS' ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, delta * 1.5); // Ornaments lag slightly behind foliage

    ornaments.forEach((data, i) => {
      // Add individual variance
      const variance = Math.sin(i) * 0.1; 
      const adjustedProgress = THREE.MathUtils.clamp(progressRef.current + variance, 0, 1);
      
      const x = THREE.MathUtils.lerp(data.targetPos[0], data.chaosPos[0], adjustedProgress);
      const y = THREE.MathUtils.lerp(data.targetPos[1], data.chaosPos[1], adjustedProgress);
      const z = THREE.MathUtils.lerp(data.targetPos[2], data.chaosPos[2], adjustedProgress);

      tempObj.position.set(x, y, z);
      
      // Wild rotation in Chaos
      const rotForce = 1 + adjustedProgress * 10;
      tempObj.rotation.x = time * data.rotationSpeed[0] * rotForce;
      tempObj.rotation.y = time * data.rotationSpeed[1] * rotForce;
      tempObj.scale.setScalar(data.scale);

      tempObj.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObj.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial 
        color="#ffffff"
        roughness={0.15} 
        metalness={0.95} 
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
};

export default Ornaments;
