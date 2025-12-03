import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { conePoints, randomSpherePoint } from '../utils/math';
import { TreeState } from '../types';

interface FoliageProps {
  treeState: TreeState;
}

const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColor1: { value: new THREE.Color('#003311') }, 
    uColor2: { value: new THREE.Color('#0F5935') },
    uGold: { value: new THREE.Color('#F6E06D') }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aTargetPos;
    attribute vec3 aChaosPos;
    attribute float aRandom;
    varying vec3 vColor;
    varying float vBlink;

    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      float ease = easeInOutCubic(uProgress);
      vec3 pos = mix(aTargetPos, aChaosPos, ease);
      
      // Explosion effect
      if (ease > 0.0) {
         pos += normalize(pos) * sin(uTime * 5.0 + aRandom * 10.0) * 0.2 * ease;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = (6.0 * aRandom + 4.0) * (20.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      vColor = vec3(aRandom); 
      vBlink = sin(uTime * 3.0 + aRandom * 100.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uGold;
    uniform float uProgress;
    varying vec3 vColor;
    varying float vBlink;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      
      // Soft glow
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

      vec3 finalColor = mix(uColor1, uColor2, vColor.x);
      
      // Sparkle
      if (vBlink > 0.8) {
        finalColor = mix(finalColor, uGold, 0.8);
      }

      // Gold dust in chaos mode
      finalColor = mix(finalColor, uGold, uProgress * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const progressRef = useRef(0);
  const count = 20000;
  
  const { positions, chaosPositions, randoms } = useMemo(() => {
    const target = conePoints(count, 14, 6);
    const chaos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const [cx, cy, cz] = randomSpherePoint(18);
      chaos[i * 3] = cx;
      chaos[i * 3 + 1] = cy + 6;
      chaos[i * 3 + 2] = cz;
      rnd[i] = Math.random();
    }
    return { positions: target, chaosPositions: chaos, randoms: rnd };
  }, []);

  useFrame(({ clock }, delta) => {
    // Internal state management for smooth animation
    const target = treeState === 'CHAOS' ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, delta * 2.0);

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
      shaderRef.current.uniforms.uProgress.value = progressRef.current;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTargetPos" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aChaosPos" count={count} array={chaosPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;
