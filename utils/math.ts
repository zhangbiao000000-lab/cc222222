import * as THREE from 'three';

// Generate random position in a sphere
export const randomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

// Get a random point on the surface of a cone (for individual items)
export const randomConePoint = (height: number, radiusBase: number): [number, number, number] => {
  const y = Math.random() * height; // 0 to height
  const currentRadius = radiusBase * (1 - y / height);
  const theta = Math.random() * 2 * Math.PI;
  
  const x = currentRadius * Math.cos(theta);
  const z = currentRadius * Math.sin(theta);
  
  // Center vertically like the foliage
  return [x, y - height / 2, z];
};

// Generate points on a cone surface (Golden Spiral distribution)
export const conePoints = (count: number, height: number, radiusBase: number): Float32Array => {
  const points = new Float32Array(count * 3);
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const y = (i / count) * height; // 0 to height
    const currentRadius = radiusBase * (1 - y / height);
    const theta = 2 * Math.PI * i / goldenRatio;
    
    // Add some noise for "fluffiness"
    const rNoise = (Math.random() - 0.5) * 0.5;
    const yNoise = (Math.random() - 0.5) * 0.5;

    points[i * 3] = (currentRadius + rNoise) * Math.cos(theta);
    points[i * 3 + 1] = y - (height / 2) + yNoise; // Center Y
    points[i * 3 + 2] = (currentRadius + rNoise) * Math.sin(theta);
  }
  return points;
};