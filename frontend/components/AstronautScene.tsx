"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html, Lightformer, OrbitControls, Stars, useGLTF, useProgress } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import SmokeAura from "./SmokeAura";
import AuraOutline from "./AuraOutline";
import InjuryEffect from "./InjuryEffect";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { getIndicatorColor, SEVERITY_META } from "@aura/core/config/aura";
import { bodyRegionLabel } from "@aura/core/lib/evaluate";
import type { BodyRegion, HazardCategory, Severity } from "@aura/core/lib/types";
import { useAuraStore } from "@/store/useAuraStore";

// Local astronaut asset keeps the 3D viewer available offline.
const MODEL_URL = "/models/astronaut_by_jungle_jim.glb";
const DRACO_PATH = "/draco/";
const HEIGHT = 1.9;

/** Body anchors as fractions of the model's bounds: x of half-width (astronaut's right = −x, facing +z), y of height, z of half-depth. */
const REGION_ANCHOR: Record<BodyRegion, [number, number, number]> = {
  abdomen: [0, 0.54, 0.55],
  head: [0, 0.88, 0.35],
  chest: [0, 0.68, 0.45],
  back: [0, 0.68, -0.9],
  rightArm: [-0.67, 0.665, 0.4],
  leftArm: [0.67, 0.665, 0.4],
  rightHand: [-0.88, 0.515, 0.61],
  leftHand: [0.88, 0.515, 0.61],
  rightLeg: [-0.33, 0.27, 0.15],
  leftLeg: [0.33, 0.27, 0.15],
};

// Ellipsoid radii in the normalized 1.9 m suit frame, fitted to the model's regions.
const REGION_RADII: Record<BodyRegion, [number, number, number]> = {
  abdomen: [0.23, 0.2, 0.18],
  head: [0.23, 0.25, 0.24], chest: [0.28, 0.25, 0.2], back: [0.28, 0.28, 0.18],
  rightArm: [0.19, 0.24, 0.18], leftArm: [0.19, 0.24, 0.18],
  rightHand: [0.125, 0.17, 0.15], leftHand: [0.125, 0.17, 0.15],
  rightLeg: [0.17, 0.47, 0.2], leftLeg: [0.17, 0.47, 0.2],
};

/** Where each whole-body hazard pins its callout. */
const CATEGORY_ANCHOR: Partial<Record<HazardCategory, [number, number, number]>> = {
  radiation: [-0.9, 0.95, 0],
  air: [0.34, 0.9, 0.3],
  cabinHot: [0.88, 0.45, 0],
  cabinCold: [-0.88, 0.35, 0],
  mental: [0.12, 1.02, 0],
};

const CALLOUT_LABEL: Record<Exclude<HazardCategory, "injury">, string> = {
  radiation: "Radiation",
  air: "Air quality",
  cabinHot: "Cabin heat",
  cabinCold: "Cabin cold",
  mental: "Mental",
};

const SHELL_ORDER: HazardCategory[] = ["radiation", "air", "cabinHot", "cabinCold"];

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Opacity that eases toward the severity target and pulses when critical. */
function useAuraOpacity(sev: Severity, onFrame: (opacity: number, t: number, pulse: boolean) => void) {
  const current = useRef(0);
  useFrame(({ clock }, dt) => {
    const meta = SEVERITY_META[sev];
    const t = clock.elapsedTime;
    const target = sev === "nominal" ? 0 : sev === "critical" ? 1 : 0.38;
    current.current += (target - current.current) * Math.min(1, dt * 3);
    const wave = meta.pulse ? 0.55 + 0.45 * Math.sin(t * 4.5) : 0.92 + 0.08 * Math.sin(t * 1.4);
    onFrame(current.current * wave, t, meta.pulse);
  });
}

function Glow({ position, color, sev, size }: { position: THREE.Vector3; color: string; sev: Severity; size: number }) {
  const sprite = useRef<THREE.Sprite>(null);
  const texture = useMemo(() => makeGlowTexture(), []);
  useAuraOpacity(sev, (o, t, pulse) => {
    const s = sprite.current;
    if (!s) return;
    (s.material as THREE.SpriteMaterial).opacity = o;
    s.scale.setScalar(size * (1 + (pulse ? 0.25 : 0.06) * Math.sin(t * (pulse ? 4.5 : 1.4))));
    s.visible = o > 0.004;
  });
  return (
    <sprite ref={sprite} position={position}>
      <spriteMaterial map={texture} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

/** Signature move: a label pinned to the body by a leader line; it tracks the anchor as the model turns. */
type Side = "left" | "right" | "up";
const SIDE_LAYOUT: Record<Side, { shift: string; flex: string; line: string }> = {
  left: { shift: "translate(-100%, -50%)", flex: "flex-row-reverse items-center", line: "h-px w-10" },
  right: { shift: "translateY(-50%)", flex: "flex-row items-center", line: "h-px w-10" },
  up: { shift: "translate(-50%, -100%)", flex: "flex-col-reverse items-center", line: "h-10 w-px" },
};
// Hands sit near the viewport edge, so their callouts rise instead of running sideways off-screen.
const sideFor = (r: BodyRegion | null, x: number): Side => (r === "leftHand" || r === "rightHand" ? "up" : x < 0 || r === "head" || r === "chest" || r === "back" ? "left" : "right");

// Callouts stay mounted and only empty when inactive: unmounting drei's <Html> tears down its own React root
// mid-render, which React reports as a race when a scenario switch clears several alerts at once.
function Callout({ position, side, color, label, sev, active }: { position: THREE.Vector3; side: Side; color: string; label: string; sev: Severity; active: boolean }) {
  const layout = SIDE_LAYOUT[side];
  return (
    <Html position={position} zIndexRange={[20, 0]} className="astronaut-callout" style={{ pointerEvents: "none" }}>
      {active && <div style={{ transform: layout.shift }}>
        <div className={`flex ${layout.flex}`}>
          <span className={`h-2 w-2 shrink-0 rounded-full ${sev === "critical" ? "pulse" : ""}`} style={{ background: color, boxShadow: `0 0 8px 1px ${color}` }} />
          <span className={`${layout.line} shrink-0`} style={{ background: color, opacity: 0.8 }} />
          <span
            className="whitespace-nowrap rounded-[4px] border bg-[rgb(8_11_17/0.86)] px-2 py-1 font-mono text-[11px] leading-none text-[#e6edf7]"
            style={{ borderColor: `${color}99` }}
          >
            {label} <span className={sev === "critical" ? "font-semibold" : ""} style={{ color: SEVERITY_META[sev].badgeColor }}>· {SEVERITY_META[sev].label.toLowerCase()}</span>
          </span>
        </div>
      </div>}
    </Html>
  );
}

function Astronaut({ onReady }: { onReady?: () => void }) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);
  useEffect(() => { onReady?.(); }, [onReady]);
  const categories = useAuraStore((s) => s.categories);
  const reportedInjuries = useAuraStore((s) => s.readings.injuries);
  const readings = useAuraStore((s) => s.readings);
  const metrics = useAuraStore((s) => s.metrics);
  const coreTemperature = metrics.find((metric) => metric.metric === "coreTemp");

  const { model, geometries, anchor } = useMemo(() => {
    const model = scene.clone(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = HEIGHT / size.y;
    model.scale.setScalar(scale);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    model.updateMatrixWorld(true);

    // Shell geometries in world space so shells and model share one frame.
    const geometries: THREE.BufferGeometry[] = [];
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      // Position-only + welded vertices: smooth normals keep the inflated shell in one piece.
      const raw = new THREE.BufferGeometry();
      raw.setAttribute("position", mesh.geometry.getAttribute("position").clone());
      if (mesh.geometry.index) raw.setIndex(mesh.geometry.index.clone());
      raw.applyMatrix4(mesh.matrixWorld);
      const g = mergeVertices(raw, 1e-4);
      g.computeVertexNormals();
      geometries.push(g);
    });

    const half = new THREE.Vector3(size.x / 2, size.y, size.z / 2).multiplyScalar(scale);
    const anchor = ([fx, fy, fz]: [number, number, number]) => new THREE.Vector3(fx * half.x, fy * half.y, fz * half.z);
    return { model, geometries, anchor };
  }, [scene]);

  const injuryVolumes = useMemo(() => (Object.keys(REGION_ANCHOR) as BodyRegion[]).map((region) => ({
    region, center: anchor(REGION_ANCHOR[region]), radii: new THREE.Vector3(...REGION_RADII[region]),
  })), [anchor]);

  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.03;
  });

  const injury = categories.find((c) => c.category === "injury")!;
  const activeShells = new Set(categories.filter((c) => c.severity !== "nominal").map((c) => c.category));

  return (
    <group ref={group}>
      <primitive object={model} />
      {SHELL_ORDER.map((c, index) => (
        <group key={c}>
          <AuraOutline category={c} geometries={geometries} severity={categories.find((status) => status.category === c)!.severity} thickness={0.02 + index * 0.008} />
          <SmokeAura category={c} geometries={geometries} severity={categories.find((status) => status.category === c)!.severity} />
        </group>
      ))}
      <Glow position={anchor([0, 0.88, 0])} color={getIndicatorColor("mental", categories.find((c) => c.category === "mental")!.severity)} sev={categories.find((c) => c.category === "mental")!.severity} size={1.4} />
      {injuryVolumes.map(({ region, center, radii }) => (
        <InjuryEffect key={region} geometries={geometries} center={center} radii={radii} severity={injury.regions[region] ?? "nominal"} context={region === "chest" && (reportedInjuries[region] ?? "nominal") === "nominal" ? coreTemperature : undefined} />
      ))}

      {categories
        .filter((c) => c.category !== "injury")
        .map((c) => {
          const a = CATEGORY_ANCHOR[c.category]!;
          return (
            <Callout key={c.category} active={activeShells.has(c.category)} position={anchor(a)} side={sideFor(null, a[0])} color={getIndicatorColor(c.category, c.severity)} label={CALLOUT_LABEL[c.category as Exclude<HazardCategory, "injury">]} sev={c.severity} />
          );
        })}
      {(Object.keys(REGION_ANCHOR) as BodyRegion[]).map((r) => {
        const sev = injury.regions[r] ?? "nominal";
        const a = REGION_ANCHOR[r];
        const active = sev !== "nominal";
        return <Callout key={r} active={active} position={anchor(a)} side={sideFor(r, a[0])} color={getIndicatorColor("injury", sev, r === "chest" && (reportedInjuries[r] ?? "nominal") === "nominal" ? coreTemperature : undefined)} label={active ? bodyRegionLabel(r, readings, metrics) : ""} sev={sev} />;
      })}
    </group>
  );
}

/** Stage under the figure: concentric rings and ticks in the interaction cyan, slowly turning. */
function Stage() {
  const ring = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.z += dt * 0.08;
  });
  const ticks = Array.from({ length: 48 }, (_, i) => (i / 48) * Math.PI * 2);
  return (
    <group position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[1.0, 64]} />
        <meshBasicMaterial color="#d4d4d4" transparent opacity={0.035} depthWrite={false} />
      </mesh>
      <group ref={ring}>
        {[0.5, 0.76, 1.0].map((r, i) => (
          <mesh key={r}>
            <ringGeometry args={[r, r + (i === 2 ? 0.008 : 0.005), 128]} />
            <meshBasicMaterial color="#d4d4d4" transparent opacity={i === 2 ? 0.55 : 0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
        {ticks.map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 1.06, Math.sin(a) * 1.06, 0]} rotation={[0, 0, a]}>
            <planeGeometry args={[i % 4 === 0 ? 0.09 : 0.04, 0.006]} />
            <meshBasicMaterial color="#d4d4d4" transparent opacity={0.45} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function AstronautScene({ autoRotate, onInteract, onReady }: { autoRotate: boolean; onInteract: () => void; onReady?: () => void }) {
  const { active, progress } = useProgress();
  return (
    <>
    <Canvas dpr={[1, 2]} camera={{ position: [0, 1.1, 4.2], fov: 36 }} gl={{ antialias: true }}>
      <color attach="background" args={["#050505"]} />
      <Stars radius={60} depth={40} count={2200} factor={3} fade speed={0.4} />
      <hemisphereLight args={["#dbe8ff", "#0b0e14", 0.9]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#e8eef6" />
      {/* rim light from behind separates the suit from the starfield */}
      <directionalLight position={[0, 3, -5]} intensity={2.4} color="#f1f5fa" />
      {/* local reflection environment for the suit and visor: no network fetch, works offline */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.5} position={[0, 4, 3]} scale={[6, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.2} position={[-4, 1, 0]} scale={[2, 4, 1]} color="#eef3f8" />
        <Lightformer form="ring" intensity={0.8} position={[3, 1, -3]} scale={2} color="#ffffff" />
      </Environment>
      <Stage />
      {/* no fallback inside the canvas: drei <Html> as a Suspense fallback unmounts its own React root mid-render */}
      <Suspense fallback={null}>
        <Astronaut onReady={onReady} />
      </Suspense>
      <OrbitControls target={[0, 0.95, 0]} enablePan={false} enableDamping={false} minDistance={2.6} maxDistance={7} autoRotate={autoRotate} autoRotateSpeed={0.6} onStart={onInteract} />
    </Canvas>
    {active && (
      <div className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-xs text-[#a9b4c7]" role="status">
        Loading astronaut model · {Math.round(progress)}%
      </div>
    )}
    </>
  );
}

useGLTF.preload(MODEL_URL, DRACO_PATH);
