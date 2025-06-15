"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshBasicMaterial, Mesh } from "three";
import { cn } from "@/lib/utils";

interface CanvasRevealEffectProps {
  containerClassName?: string;
}

export const CanvasRevealEffect = ({
  containerClassName,
}: CanvasRevealEffectProps) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });

  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          ref={materialRef}
          transparent={true}
          opacity={0.5}
          color="#ffffff"
        />
      </mesh>
    </div>
  );
};
