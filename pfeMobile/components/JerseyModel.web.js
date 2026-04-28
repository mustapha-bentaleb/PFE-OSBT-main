import React, { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { createPatternTexture } from "./patterns.web";

function Jersey(props) {
  const {
    mainColor,
    secondColor,
    collarColor,
    insideColor,
    pattern,
    number,
    name,
    name_number_color,
    textFont,
    sponsor,
    sponsorColor,
    sponsorFont,
    brand,
    logo,
    logoPosition
  } = props;

  const { nodes } = useGLTF("/football_jersey_style_design.glb");
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let loaded = 0;
    let cancelled = false;
    const images = [`/logos/${brand}.png`, logo].filter(Boolean);
    if (images.length === 0) return;

    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      const done = () => {
        loaded += 1;
        if (loaded === images.length && !cancelled) setLoadKey((k) => k + 1);
      };
      img.onload = done;
      img.onerror = done;
    });

    return () => {
      cancelled = true;
    };
  }, [brand, logo]);

  const texture = useMemo(() => {
    const canvas = createPatternTexture(pattern, mainColor, secondColor, 1024, {
      number,
      name,
      name_number_color,
      textFont,
      sponsor,
      sponsorColor,
      sponsorFont,
      brand,
      collarColor,
      logo,
      logoPosition
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, [
    loadKey,
    pattern,
    mainColor,
    secondColor,
    collarColor,
    number,
    name,
    name_number_color,
    textFont,
    sponsor,
    sponsorColor,
    sponsorFont,
    brand,
    logo,
    logoPosition
  ]);

  if (!nodes?.Object_2?.geometry) return null;

  return (
    <group rotation={[-Math.PI / 2, 0, 2.9]} scale={[0.08, 0.08, 0.08]} position={[0, -10.4, 0]}>
      <mesh geometry={nodes.Object_2.geometry}>
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={nodes.Object_3.geometry}>
        <meshStandardMaterial color={insideColor || "#0f172a"} />
      </mesh>
      <mesh geometry={nodes.Object_4.geometry}>
        <meshStandardMaterial color={secondColor || "#334155"} />
      </mesh>
      <mesh geometry={nodes.Object_5.geometry}>
        <meshStandardMaterial color={collarColor || "#ffffff"} />
      </mesh>
      <mesh geometry={nodes.Object_6.geometry}>
        <meshStandardMaterial color={secondColor || "#334155"} />
      </mesh>
    </group>
  );
}

useGLTF.preload("/football_jersey_style_design.glb");

export default function Model({ backgroundColor = "#000000", ...props }) {
  return (
    <div style={{ width: "100%", height: "100%", margin: 0 }}>
      <Canvas camera={{ position: [0, 0, -10], fov: 45 }}>
        <color attach="background" args={[backgroundColor]} />
        <ambientLight intensity={1} />
        <directionalLight position={[2, 2, 2]} intensity={1} />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2.5} />
        <Jersey {...props} />
      </Canvas>
    </div>
  );
}
