"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CATEGORY_META } from "@aura/core/config/aura";
import type { Severity } from "@aura/core/lib/types";

const vertex = `
  uniform float uThickness;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vPosition = position;
    vec4 mv = modelViewMatrix * vec4(position + normal * uThickness, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const fragment = `
  uniform vec3 uCenter;
  uniform vec3 uRadii;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uOutline;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float distance = length((vPosition - uCenter) / uRadii);
    float mask = 1.0 - smoothstep(0.72, 1.0, distance);
    if (mask < 0.005) discard;
    float rim = pow(1.0 - abs(dot(vNormal, vView)), 1.8);
    float contour = smoothstep(0.54, 0.61, distance) * (1.0 - smoothstep(0.64, 0.71, distance));
    float surface = 0.32 + rim * 0.35 + contour * 0.18;
    float alpha = mix(surface, rim, uOutline) * mask * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(change: () => void) {
  const query = matchMedia(motionQuery);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

function regionPatch(geometries: THREE.BufferGeometry[], center: THREE.Vector3, radii: THREE.Vector3) {
  const positions: number[] = [], normals: number[] = [];
  for (const geometry of geometries) {
    const position = geometry.getAttribute("position"), normal = geometry.getAttribute("normal"), index = geometry.index;
    for (let triangle = 0; triangle < (index?.count ?? position.count); triangle += 3) {
      const vertices = [0, 1, 2].map((offset) => index ? index.getX(triangle + offset) : triangle + offset);
      const points = vertices.map((vertex) => new THREE.Vector3().fromBufferAttribute(position, vertex));
      const bounds = new THREE.Box3().setFromPoints(points);
      if (bounds.max.x < center.x - radii.x || bounds.min.x > center.x + radii.x || bounds.max.y < center.y - radii.y || bounds.min.y > center.y + radii.y || bounds.max.z < center.z - radii.z || bounds.min.z > center.z + radii.z) continue;
      vertices.forEach((vertex, offset) => {
        positions.push(...points[offset].toArray());
        normals.push(normal.getX(vertex), normal.getY(vertex), normal.getZ(vertex));
      });
    }
  }
  const patch = new THREE.BufferGeometry();
  patch.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  patch.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  return patch;
}

export default function InjuryEffect({ geometries, center, radii, severity }: { geometries: THREE.BufferGeometry[]; center: THREE.Vector3; radii: THREE.Vector3; severity: Severity }) {
  const group = useRef<THREE.Group>(null);
  const opacity = useRef(0);
  const reduced = useSyncExternalStore(subscribeMotion, () => matchMedia(motionQuery).matches, () => false);
  const patch = useMemo(() => regionPatch(geometries, center, radii), [geometries, center, radii]);
  useEffect(() => () => patch.dispose(), [patch]);
  const { materials, texture, puffs } = useMemo(() => {
    const materials = [0, 1].map((outline) => new THREE.ShaderMaterial({
      vertexShader: vertex, fragmentShader: fragment,
      uniforms: {
        uCenter: { value: center }, uRadii: { value: radii },
        uColor: { value: new THREE.Color(CATEGORY_META.injury.color) },
        uOpacity: { value: 0 }, uOutline: { value: outline },
        uThickness: { value: outline ? 0.018 : 0.003 },
      },
      transparent: true, depthWrite: false, depthTest: true,
      blending: outline ? THREE.AdditiveBlending : THREE.NormalBlending,
    }));
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d")!;
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,0.45)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.2)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    const puffs = Array.from({ length: 8 }, (_, index) => {
      const angle = index * Math.PI / 4;
      return center.clone().add(new THREE.Vector3(Math.cos(angle) * radii.x * 0.75, Math.sin(angle) * radii.y * 0.75, radii.z * (index % 2 ? 0.7 : -0.7)));
    });
    return { materials, texture: new THREE.CanvasTexture(canvas), puffs };
  }, [center, radii]);
  useEffect(() => () => { materials.forEach((material) => material.dispose()); texture.dispose(); }, [materials, texture]);
  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const target = severity === "nominal" ? 0 : severity === "critical" ? 1 : 0.6;
    opacity.current += (target - opacity.current) * Math.min(1, dt * 4);
    group.current.visible = opacity.current > 0.004;
    const pulse = severity === "critical" && !reduced ? 0.8 + 0.2 * Math.sin(clock.elapsedTime * 4.5) : 1;
    for (const layer of group.current.children.slice(0, 2)) {
      const material = (layer.children[0] as THREE.Mesh).material as THREE.ShaderMaterial;
      material.uniforms.uOpacity.value = opacity.current * pulse;
    }
    group.current.children[2].children.forEach((child, index) => {
      const sprite = child as THREE.Sprite;
      sprite.position.copy(puffs[index]);
      if (!reduced) sprite.position.y += Math.sin(clock.elapsedTime * 0.7 + index) * 0.012;
      (sprite.material as THREE.SpriteMaterial).opacity = opacity.current * pulse * 0.22;
    });
  });
  return <group ref={group}>
    {materials.map((material, layer) => <group key={layer}><mesh geometry={patch} material={material} /></group>)}
    <group>{puffs.map((position, index) => <sprite key={index} position={position} scale={Math.max(radii.x, radii.y) * 1.5}><spriteMaterial map={texture} color={CATEGORY_META.injury.color} transparent depthWrite={false} depthTest /></sprite>)}</group>
  </group>;
}
