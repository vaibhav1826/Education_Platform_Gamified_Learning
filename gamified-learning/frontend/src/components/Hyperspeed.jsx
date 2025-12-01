import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect } from 'postprocessing';

const PRESETS = {
  neoAurora: {
    label: 'Neo Aurora',
    roadWidth: 12,
    roadLength: 200,
    lanes: 4,
    backgroundColor: '#030712',
    roadColor: '#020617',
    laneGlowColor: '#22d3ee',
    lightStickColor: '#38bdf8',
    lightStickCount: 40,
    lightStickSize: { width: 0.3, height: 4 },
    lightStickSpeed: 120,
    cars: { count: 12, minSize: [1.0, 0.6, 2.4], maxSize: [1.6, 0.9, 3.6] },
    carColors: ['#22d3ee', '#a855f7', '#e11d48', '#22c55e'],
    carBaseSpeed: 90,
    distortion: { mode: 'turbulent', intensity: 0.4 },
    fog: true
  },
  royalPulse: {
    label: 'Royal Pulse',
    roadWidth: 10,
    roadLength: 170,
    lanes: 3,
    backgroundColor: '#020617',
    roadColor: '#020617',
    laneGlowColor: '#a855f7',
    lightStickColor: '#f97316',
    lightStickCount: 30,
    lightStickSize: { width: 0.35, height: 3 },
    lightStickSpeed: 100,
    cars: { count: 9, minSize: [0.8, 0.5, 2.2], maxSize: [1.4, 0.9, 3.0] },
    carColors: ['#f97316', '#facc15', '#f97316', '#22d3ee'],
    carBaseSpeed: 80,
    distortion: { mode: 'xy', intensity: 0.35 },
    fog: true
  },
  frostHyper: {
    label: 'Frost Hyper',
    roadWidth: 14,
    roadLength: 220,
    lanes: 5,
    backgroundColor: '#020617',
    roadColor: '#020617',
    laneGlowColor: '#38bdf8',
    lightStickColor: '#e0f2fe',
    lightStickCount: 60,
    lightStickSize: { width: 0.25, height: 5 },
    lightStickSpeed: 150,
    cars: { count: 16, minSize: [0.9, 0.5, 2.8], maxSize: [1.4, 0.8, 3.8] },
    carColors: ['#e0f2fe', '#38bdf8', '#22d3ee'],
    carBaseSpeed: 120,
    distortion: { mode: 'mountain', intensity: 0.5 },
    fog: true
  },
  darkNebula: {
    label: 'Dark Nebula',
    roadWidth: 11,
    roadLength: 210,
    lanes: 4,
    backgroundColor: '#020617',
    roadColor: '#030712',
    laneGlowColor: '#f97316',
    lightStickColor: '#22c55e',
    lightStickCount: 50,
    lightStickSize: { width: 0.3, height: 4.5 },
    lightStickSpeed: 130,
    cars: { count: 14, minSize: [1.0, 0.6, 2.6], maxSize: [1.7, 0.9, 3.4] },
    carColors: ['#f97316', '#22c55e', '#facc15'],
    carBaseSpeed: 105,
    distortion: { mode: 'turbulent', intensity: 0.5 },
    fog: true
  },
  vaporTrail: {
    label: 'Vapor Trail',
    roadWidth: 9,
    roadLength: 180,
    lanes: 3,
    backgroundColor: '#020617',
    roadColor: '#020617',
    laneGlowColor: '#22c55e',
    lightStickColor: '#22d3ee',
    lightStickCount: 26,
    lightStickSize: { width: 0.3, height: 4 },
    lightStickSpeed: 90,
    cars: { count: 8, minSize: [0.8, 0.5, 2.3], maxSize: [1.2, 0.7, 3.0] },
    carColors: ['#22c55e', '#22d3ee', '#a855f7'],
    carBaseSpeed: 70,
    distortion: { mode: 'xy', intensity: 0.25 },
    fog: false
  },
  roseQuantum: {
    label: 'Rose Quantum',
    roadWidth: 13,
    roadLength: 230,
    lanes: 4,
    backgroundColor: '#020617',
    roadColor: '#020617',
    laneGlowColor: '#fb7185',
    lightStickColor: '#f97316',
    lightStickCount: 55,
    lightStickSize: { width: 0.35, height: 5 },
    lightStickSpeed: 140,
    cars: { count: 18, minSize: [0.9, 0.5, 2.6], maxSize: [1.5, 0.9, 3.6] },
    carColors: ['#fb7185', '#f97316', '#22d3ee'],
    carBaseSpeed: 115,
    distortion: { mode: 'mountain', intensity: 0.6 },
    fog: true
  }
};

const Hyperspeed = ({ presetKey = 'neoAurora', presetOverride }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const composerRef = useRef(null);
  const frameRef = useRef(0);
  const objectsRef = useRef({ road: null, lightSticks: [], cars: [] });
  const [activePreset, setActivePreset] = useState(() => ({
    ...PRESETS[presetKey],
    ...(presetOverride || {})
  }));

  // Update preset when key or override changes
  useEffect(() => {
    setActivePreset({ ...PRESETS[presetKey], ...(presetOverride || {}) });
  }, [presetKey, presetOverride]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
    camera.position.set(0, 3.5, 6);
    camera.rotation.x = -0.4;

    if (activePreset.fog) {
      scene.fog = new THREE.Fog(activePreset.backgroundColor, 10, 140);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    renderer.setClearColor(activePreset.backgroundColor, 1);
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomEffect = new BloomEffect({
      intensity: 1.3,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.9
    });
    const bloomPass = new EffectPass(camera, bloomEffect);
    bloomPass.renderToScreen = true;
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // Road
    const roadGeometry = new THREE.PlaneGeometry(activePreset.roadWidth, activePreset.roadLength, 1, 32);
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: activePreset.roadColor,
      roughness: 0.9,
      metalness: 0.2
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -activePreset.roadLength / 4;
    scene.add(road);

    // Lane lines glow approximation
    const laneGroup = new THREE.Group();
    const laneMaterial = new THREE.MeshBasicMaterial({
      color: activePreset.laneGlowColor,
      transparent: true,
      opacity: 0.5
    });
    const laneCount = activePreset.lanes;
    for (let i = 0; i <= laneCount; i += 1) {
      const x = (i / laneCount - 0.5) * activePreset.roadWidth;
      const laneGeom = new THREE.PlaneGeometry(0.05, activePreset.roadLength);
      const lane = new THREE.Mesh(laneGeom, laneMaterial);
      lane.rotation.x = -Math.PI / 2;
      lane.position.set(x, 0.01, road.position.z);
      laneGroup.add(lane);
    }
    scene.add(laneGroup);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    scene.add(ambient);
    scene.add(dir);

    // Light sticks
    const lightSticks = [];
    const stickGeom = new THREE.BoxGeometry(
      activePreset.lightStickSize.width,
      activePreset.lightStickSize.height,
      0.4
    );
    const stickMat = new THREE.MeshBasicMaterial({
      color: activePreset.lightStickColor
    });
    const halfWidth = activePreset.roadWidth / 2 + 0.8;

    for (let i = 0; i < activePreset.lightStickCount; i += 1) {
      const stickLeft = new THREE.Mesh(stickGeom, stickMat);
      const stickRight = new THREE.Mesh(stickGeom, stickMat);
      const zPos = -i * (activePreset.roadLength / activePreset.lightStickCount);
      const yPos = activePreset.lightStickSize.height / 2;
      stickLeft.position.set(-halfWidth, yPos, zPos);
      stickRight.position.set(halfWidth, yPos, zPos);
      scene.add(stickLeft, stickRight);
      lightSticks.push(stickLeft, stickRight);
    }

    // Cars
    const cars = [];
    const carGeom = new THREE.BoxGeometry(1, 0.6, 2.6);
    const carMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'),
      metalness: 0.8,
      roughness: 0.3,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.6
    });

    const laneOffsets = [];
    for (let i = 0; i < activePreset.lanes; i += 1) {
      laneOffsets.push(((i + 0.5) / activePreset.lanes - 0.5) * (activePreset.roadWidth - 3));
    }

    const randomInRange = (min, max) => min + Math.random() * (max - min);

    for (let i = 0; i < activePreset.cars.count; i += 1) {
      const laneIndex = Math.floor(Math.random() * laneOffsets.length);
      const car = new THREE.Mesh(carGeom.clone(), carMaterial.clone());
      const sizeX = randomInRange(activePreset.cars.minSize[0], activePreset.cars.maxSize[0]);
      const sizeY = randomInRange(activePreset.cars.minSize[1], activePreset.cars.maxSize[1]);
      const sizeZ = randomInRange(activePreset.cars.minSize[2], activePreset.cars.maxSize[2]);
      car.scale.set(sizeX, sizeY, sizeZ / 2.6);
      car.position.set(
        laneOffsets[laneIndex],
        0.6,
        -Math.random() * activePreset.roadLength
      );
      const color = activePreset.carColors[Math.floor(Math.random() * activePreset.carColors.length)];
      car.material.color = new THREE.Color(color);
      car.material.emissive = new THREE.Color(color);
      const speed = activePreset.carBaseSpeed * (0.6 + Math.random() * 0.9);
      const laneShiftAmplitude = 0.4 + Math.random() * 0.35;
      const laneShiftSpeed = 0.5 + Math.random() * 1.0;
      scene.add(car);
      cars.push({
        mesh: car,
        laneIndex,
        baseX: laneOffsets[laneIndex],
        speed,
        laneShiftAmplitude,
        laneShiftSpeed,
        offset: Math.random() * Math.PI * 2
      });
    }

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    composerRef.current = composer;
    objectsRef.current = { road, lightSticks, cars };

    let lastTime = performance.now();
    let rafId;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      frameRef.current += delta;

      const t = frameRef.current;
      const distortion = activePreset.distortion;

      // Camera-based distortion modes
      if (distortion?.mode === 'turbulent') {
        camera.position.x = Math.sin(t * 1.2) * distortion.intensity * 0.6;
        camera.position.y = 3.5 + Math.cos(t * 1.5) * distortion.intensity * 0.6;
        camera.rotation.z = Math.sin(t * 0.7) * distortion.intensity * 0.3;
      } else if (distortion?.mode === 'xy') {
        camera.position.x = Math.sin(t * 0.9) * distortion.intensity * 0.5;
        camera.rotation.z = Math.sin(t * 1.1) * distortion.intensity * 0.35;
      } else if (distortion?.mode === 'mountain') {
        camera.position.y = 3.5 + Math.abs(Math.sin(t * 0.8)) * distortion.intensity * 1.2;
        camera.position.x = Math.sin(t * 0.4) * distortion.intensity * 0.3;
        camera.rotation.z = Math.sin(t * 0.4) * distortion.intensity * 0.2;
      }

      // Move light sticks towards the camera and loop
      const stickSpeed = activePreset.lightStickSpeed;
      const resetZ = 10;
      const minZ = -activePreset.roadLength;
      for (const stick of lightSticks) {
        stick.position.z += stickSpeed * delta;
        if (stick.position.z > resetZ) {
          stick.position.z = minZ;
        }
      }

      // Move cars and animate gentle lane shifts
      for (const car of cars) {
        car.mesh.position.z += car.speed * delta;
        if (car.mesh.position.z > 20) {
          car.mesh.position.z = -activePreset.roadLength;
        }
        const lateralOffset =
          Math.sin(t * car.laneShiftSpeed + car.offset) * car.laneShiftAmplitude;
        car.mesh.position.x = car.baseX + lateralOffset;
      }

      composer.render(delta);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current || !composerRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      composerRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose && m.dispose());
          } else {
            obj.material?.dispose && obj.material.dispose();
          }
        }
      });
    };
    // We intentionally only init once on mount; preset changes are handled via state values in animate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="hyperspeed-canvas" aria-hidden />;
};

export const hyperspeedPresets = PRESETS;

export default Hyperspeed;


