"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getIndicatorColor } from "@aura/core/config/aura";
import type { HazardCategory, Severity } from "@aura/core/lib/types";

export default function SmokeAura({ category, severity, geometries }: { category: HazardCategory; severity: Severity; geometries: THREE.BufferGeometry[] }) {
  const group = useRef<THREE.Group>(null);
  const opacity = useRef(0);
  const { texture, puffs } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d")!;
    for (let i = 0; i < 18; i++) {
      const x = 64 + Math.sin(i * 8.31) * 24;
      const y = 64 + Math.cos(i * 3.71) * 24;
      const gradient = context.createRadialGradient(x, y, 0, x, y, 30);
      gradient.addColorStop(0, "rgba(255,255,255,0.18)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
    }
    const total = geometries.reduce((sum, geometry) => sum + geometry.getAttribute("position").count, 0);
    const puffs = Array.from({ length: 72 }, (_, index) => {
      let vertex = Math.floor(((index * 0.61803398875) % 1) * total);
      let geometry = geometries[0];
      for (const candidate of geometries) {
        geometry = candidate;
        if (vertex < candidate.getAttribute("position").count) break;
        vertex -= candidate.getAttribute("position").count;
      }
      const position = new THREE.Vector3().fromBufferAttribute(geometry.getAttribute("position"), vertex);
      const normal = new THREE.Vector3().fromBufferAttribute(geometry.getAttribute("normal"), vertex);
      return { position: position.addScaledVector(normal, 0.09), phase: index * 2.4, size: 0.32 + (index % 5) * 0.045 };
    });
    return { texture: new THREE.CanvasTexture(canvas), puffs };
  }, [geometries]);
  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const target = severity === "nominal" ? 0 : severity === "critical" ? 0.42 : 0.18;
    opacity.current += (target - opacity.current) * Math.min(1, dt * 3);
    group.current.visible = opacity.current > 0.005;
    const time = clock.elapsedTime;
    const pulse = severity === "critical" ? 0.72 + Math.sin(time * 4.5) * 0.28 : 1;
    group.current.children.forEach((child, index) => {
      const sprite = child as THREE.Sprite;
      const puff = puffs[index];
      sprite.position.copy(puff.position);
      sprite.position.x += Math.sin(time * 0.5 + puff.phase) * 0.045;
      sprite.position.y += Math.sin(time * 0.4 + puff.phase) * 0.08;
      sprite.scale.setScalar(puff.size * (1 + Math.sin(time * 0.6 + puff.phase) * 0.2));
      (sprite.material as THREE.SpriteMaterial).opacity = opacity.current * pulse;
    });
  });
  return <group ref={group}>{puffs.map((puff, index) => <sprite key={index} position={puff.position}><spriteMaterial map={texture} color={getIndicatorColor(category, severity)} transparent depthWrite={false} /></sprite>)}</group>;
}
