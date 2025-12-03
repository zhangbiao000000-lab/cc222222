export type TreeState = 'CHAOS' | 'FORMED';

export interface OrnamentData {
  id: number;
  type: 'box' | 'ball' | 'light';
  color: string;
  chaosPos: [number, number, number];
  targetPos: [number, number, number];
  scale: number;
  rotationSpeed: [number, number, number];
}

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
}
