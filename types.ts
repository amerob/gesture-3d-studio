import { Vector3, Euler } from 'three';

export enum GestureType {
  NONE = 'NONE',
  IDLE = 'IDLE',      // Hand detected but neutral
  PINCH = 'PINCH',    // Pinching (Rotate)
  FIST = 'FIST',      // Fist (Scale)
}

export interface HandData {
  isPresent: boolean;
  gesture: GestureType;
  position: { x: number; y: number }; // Normalized screen coordinates (0-1)
  pinchDistance: number;
}

export interface ModelSettings {
  scale: number;
  rotation: [number, number, number];
  color: string;
  metalness: number;
  roughness: number;
  envMapIntensity: number;
}

export interface EnvironmentSettings {
  preset: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'studio' | 'city' | 'park' | 'lobby' | 'apartment';
  blur: number;
  background: boolean;
}
