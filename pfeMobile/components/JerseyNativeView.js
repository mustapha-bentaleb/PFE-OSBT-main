import React, { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { GLView } from "expo-gl";
import { Asset } from "expo-asset";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { buildJerseyTexture } from "./patterns.native";

const DEFAULT_MODEL = require("/football_jersey_style_design.glb");

export default function JerseyNativeView({
  style,
  backgroundColor = "#000000",
  mainColor,
  secondColor,
  collarColor,
  insideColor,
  pattern,
  number,
  name,
  name_number_color,
  sponsor,
  sponsorColor,
  logo
}) {
  const [viewSize, setViewSize] = useState({ width: 320, height: 240 });
  const meshGroupRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(null);
  const baseRotationRef = useRef(2.9);
  const rotationRef = useRef(2.9);

  const jerseyTexture = useMemo(
    () =>
      buildJerseyTexture({
        pattern,
        mainColor,
        secondColor,
        collarColor,
        number,
        name,
        nameColor: name_number_color,
        sponsor,
        sponsorColor,
        logo
      }),
    [pattern, mainColor, secondColor, collarColor, number, name, name_number_color, sponsor, sponsorColor, logo]
  );

  useEffect(() => {
    if (!meshGroupRef.current) return;
    const group = meshGroupRef.current;
    const mats = group.children;

    if (mats[0]?.material) {
      mats[0].material.map = jerseyTexture;
      mats[0].material.side = THREE.DoubleSide;
      mats[0].material.needsUpdate = true;
    }
    if (mats[1]?.material) mats[1].material.color = new THREE.Color(insideColor || "#0f172a");
    if (mats[2]?.material) mats[2].material.color = new THREE.Color(secondColor || "#334155");
    if (mats[3]?.material) mats[3].material.color = new THREE.Color(collarColor || "#ffffff");
    if (mats[4]?.material) mats[4].material.color = new THREE.Color(secondColor || "#334155");
  }, [jerseyTexture, insideColor, secondColor, collarColor]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          const nextRotation = baseRotationRef.current + gesture.dx * 0.01;
          rotationRef.current = nextRotation;
          if (meshGroupRef.current) meshGroupRef.current.rotation.z = nextRotation;
        },
        onPanResponderRelease: () => {
          baseRotationRef.current = rotationRef.current;
        }
      }),
    []
  );

  const onContextCreate = async (gl) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(new THREE.Color(backgroundColor));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, -10);
    cameraRef.current = camera;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 2);
    scene.add(ambientLight, directionalLight);

    const modelAsset = Asset.fromModule(DEFAULT_MODEL);
    await modelAsset.downloadAsync();

    const loader = new GLTFLoader();
    loader.load(
      modelAsset.localUri || modelAsset.uri,
      (gltf) => {
        const nodes = gltf.scene?.children || [];
        const group = new THREE.Group();
        group.rotation.set(-Math.PI / 2, 0, rotationRef.current);
        group.scale.set(0.08, 0.08, 0.08);
        group.position.set(0, -10.4, 0);

        // Expected model objects: Object_2..Object_6 (same as web).
        const meshes = nodes.filter((node) => node.isMesh);
        meshes.forEach((mesh) => {
          mesh.material = new THREE.MeshStandardMaterial({ color: "#ffffff" });
          group.add(mesh);
        });

        meshGroupRef.current = group;
        scene.add(group);
      },
      undefined,
      () => {
        // noop: if model missing, screen stays black until asset provided.
      }
    );

    const render = () => {
      frameRef.current = requestAnimationFrame(render);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        gl.endFrameEXP();
      }
    };
    render();
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      jerseyTexture?.dispose?.();
    };
  }, [jerseyTexture]);

  return (
    <View
      style={[styles.container, style]}
      onLayout={(e) => setViewSize(e.nativeEvent.layout)}
      {...panResponder.panHandlers}
    >
      <GLView
        style={{ width: viewSize.width || "100%", height: viewSize.height || "100%" }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    overflow: "hidden"
  }
});
