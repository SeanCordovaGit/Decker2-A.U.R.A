"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getIndicatorColor } from "@aura/core/config/aura";
import type { HazardCategory, Severity } from "@aura/core/lib/types";

const vertex = `
  uniform float uThickness;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position + normal * uThickness, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const fragment = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.4);
    gl_FragColor = vec4(uColor, rim * uOpacity);
  }
`;

export default function AuraOutline({ category, severity, geometries, thickness }: { category: HazardCategory; severity: Severity; geometries: THREE.BufferGeometry[]; thickness: number }) {
  const group = useRef<THREE.Group>(null);
  const opacity = useRef(0);
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uColor: { value: new THREE.Color(getIndicatorColor(category, severity)) },
      uOpacity: { value: 0 },
      uThickness: { value: thickness },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [category, severity, thickness]);
  useFrame(({ clock }, dt) => {
    if (!group.current?.children.length) return;
    const shader = (group.current.children[0] as THREE.Mesh).material as THREE.ShaderMaterial;
    const target = severity === "nominal" ? 0 : severity === "critical" ? 1 : 0.38;
    opacity.current += (target - opacity.current) * Math.min(1, dt * 3);
    const pulse = severity === "critical" ? 0.72 + 0.28 * Math.sin(clock.elapsedTime * 4.5) : 1;
    shader.uniforms.uOpacity.value = opacity.current * pulse * (category === "air" ? 2 : 1);
    shader.uniforms.uThickness.value = thickness * (severity === "critical" ? 1 + 0.18 * Math.sin(clock.elapsedTime * 4.5) : 1);
    group.current.visible = opacity.current > 0.004;
  });
  return <group ref={group}>{geometries.map((geometry, index) => <mesh key={index} geometry={geometry} material={material} />)}</group>;
}
