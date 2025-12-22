import React, { useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center, Html } from '@react-three/drei';
import { Mesh, Group, Vector3, MathUtils, Material, MeshStandardMaterial } from 'three';
import { HandData, GestureType, ModelSettings } from '../types';

// Workaround for missing R3F JSX types
const R3FGroup = 'group' as any;
const R3FPrimitive = 'primitive' as any;

interface InteractiveModelProps {
  url: string;
  handDataRef: React.MutableRefObject<HandData>;
  settings: ModelSettings;
}

const InteractiveModel: React.FC<InteractiveModelProps> = ({ url, handDataRef, settings }) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  
  // Internal state for smooth interpolation
  const targetRotation = useRef(new Vector3(0, 0, 0));
  const targetScale = useRef(1.5);
  
  // Helper for tracking previous frame hand positions
  const lastHandPos = useRef<{ x: number, y: number } | null>(null);

  // Apply materials from settings
  useLayoutEffect(() => {
    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        // Clone material to avoid affecting shared cache
        if (!mesh.userData.originalMaterial) {
            mesh.userData.originalMaterial = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        }
        
        // We create a new Standard Material derived from original or create fresh
        const originalMat = mesh.userData.originalMaterial as MeshStandardMaterial;
        
        const newMat = new MeshStandardMaterial({
            map: originalMat.map,
            normalMap: originalMat.normalMap,
            color: settings.color,
            metalness: settings.metalness,
            roughness: settings.roughness,
        });
        
        mesh.material = newMat;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene, settings]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const hand = handDataRef.current;
    
    // Smooth Lerp Factors
    const rotationLerp = 5 * delta;
    const scaleLerp = 5 * delta;

    if (hand.isPresent) {
      const currentX = hand.position.x;
      const currentY = hand.position.y;

      if (lastHandPos.current) {
         const deltaX = currentX - lastHandPos.current.x;
         const deltaY = currentY - lastHandPos.current.y;

         // INTERACTION LOGIC
         
         // 1. PINCH -> ROTATE
         if (hand.gesture === GestureType.PINCH) {
           // Sensitivity
           const rotSpeed = 8; 
           // Map X movement to Y rotation (yaw), Y movement to X rotation (pitch)
           targetRotation.current.y += deltaX * rotSpeed;
           targetRotation.current.x += deltaY * rotSpeed;
         }
         
         // 2. FIST -> SCALE
         // Use vertical hand position to drive scale size directly or delta
         if (hand.gesture === GestureType.FIST) {
            // Mapping screen Y (0 top, 1 bottom) to scale. 
            // Inverted: moving hand UP (lower Y) increases scale.
            const scaleSensitivity = 3;
            targetScale.current -= deltaY * scaleSensitivity;
            targetScale.current = MathUtils.clamp(targetScale.current, 0.5, 4.0);
         }
      }

      // Update last pos
      lastHandPos.current = { x: currentX, y: currentY };
    } else {
      // Reset tracker when hand is lost
      lastHandPos.current = null;
    }

    // Apply Transforms with LERP for smoothness
    groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, rotationLerp);
    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, rotationLerp);
    
    const currentScale = groupRef.current.scale.x;
    const nextScale = MathUtils.lerp(currentScale, targetScale.current, scaleLerp);
    groupRef.current.scale.set(nextScale, nextScale, nextScale);
    
    // Add subtle idle floating animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <R3FGroup ref={groupRef} dispose={null}>
      <Center top>
        <R3FPrimitive object={scene} />
      </Center>
    </R3FGroup>
  );
};

export default InteractiveModel;