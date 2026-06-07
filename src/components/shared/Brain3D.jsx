import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Icon from './Icon';

/* ─── Brain Region Data ─── */
const BRAIN_REGIONS = {
  'Brain_Part_01_BRAIN_TEXTURE_blinn2_0': {
    name: 'Pons',
    desc: 'Relays signals between cerebrum & cerebellum. Controls sleep, breathing, and facial movement.',
    color: '#00e5ff',
    icon: 'activity',
  },
  'Brain_Part_02_BRAIN_TEXTURE_blinn2_0': {
    name: 'Cerebellum',
    desc: 'Coordinates voluntary movements, balance, posture, and motor learning.',
    color: '#b388ff',
    icon: 'target',
  },
  'Brain_Part_03_BRAIN_TEXTURE_blinn2_0': {
    name: 'Brain Stem',
    desc: 'Controls vital autonomic functions: heart rate, breathing, blood pressure, consciousness.',
    color: '#ff6e40',
    icon: 'alertCircle',
  },
  'Brain_Part_04_BRAIN_TEXTURE_blinn2_0': {
    name: 'Right Hemisphere',
    desc: 'Processes spatial awareness, creativity, face recognition, and emotional expression.',
    color: '#40c4ff',
    icon: 'globe',
  },
  'Brain_Part_05_BRAIN_TEXTURE_blinn2_0': {
    name: 'Corpus Callosum',
    desc: 'Connects left and right hemispheres, enabling interhemispheric communication.',
    color: '#69f0ae',
    icon: 'share',
  },
  'Brain_Part_06_BRAIN_TEXTURE_blinn2_0': {
    name: 'Left Hemisphere',
    desc: 'Processes language, logic, mathematical computation, and sequential analysis.',
    color: '#448aff',
    icon: 'brain',
  },
};

const BASE_COLOR = '#7eb8cc';
const BASE_OPACITY = 0.72;
const DIM_OPACITY = 0.3;
const HIGHLIGHT_OPACITY = 0.92;

/* ─── Brain 3D Mesh ─── */
function BrainMesh({ setHovered, setTooltipPos }) {
  const groupRef = useRef();
  const materialsRef = useRef(new Map());
  const hoveredRef = useRef(null);
  const { scene } = useGLTF('/brain_areas.glb');

  const preparedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 3.5 / maxDim;

    clone.scale.setScalar(scaleFactor);
    clone.position.set(
      -center.x * scaleFactor,
      -center.y * scaleFactor,
      -center.z * scaleFactor
    );

    clone.traverse((child) => {
      if (child.isMesh) {
        const mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(BASE_COLOR),
          transparent: true,
          opacity: BASE_OPACITY,
          roughness: 0.18,
          metalness: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          envMapIntensity: 2.0,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        child.material = mat;
        materialsRef.current.set(child.name, mat);
      }
    });
    return clone;
  }, [scene]);

  // Smooth material transitions
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.1;
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.12;

    const hName = hoveredRef.current;
    materialsRef.current.forEach((mat, name) => {
      const region = BRAIN_REGIONS[name];
      if (!region) return;
      const isHovered = name === hName;
      const targetOpacity = hName ? (isHovered ? HIGHLIGHT_OPACITY : DIM_OPACITY) : BASE_OPACITY;
      mat.opacity += (targetOpacity - mat.opacity) * Math.min(delta * 8, 1);

      if (isHovered) {
        const col = new THREE.Color(region.color);
        mat.color.lerp(col, Math.min(delta * 6, 1));
        mat.emissive.lerp(col, Math.min(delta * 6, 1));
        mat.emissiveIntensity += (0.35 - mat.emissiveIntensity) * Math.min(delta * 6, 1);
      } else {
        mat.color.lerp(new THREE.Color(BASE_COLOR), Math.min(delta * 4, 1));
        mat.emissive.lerp(new THREE.Color('#000000'), Math.min(delta * 4, 1));
        mat.emissiveIntensity += (0 - mat.emissiveIntensity) * Math.min(delta * 4, 1);
      }
    });
  });

  const handleOver = useCallback((e) => {
    e.stopPropagation();
    const name = e.object.name;
    if (BRAIN_REGIONS[name]) {
      hoveredRef.current = name;
      setHovered(name);
      setTooltipPos({ x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
      document.body.style.cursor = 'pointer';
    }
  }, [setHovered, setTooltipPos]);

  const handleMove = useCallback((e) => {
    e.stopPropagation();
    const name = e.object.name;
    if (BRAIN_REGIONS[name]) {
      if (hoveredRef.current !== name) {
        hoveredRef.current = name;
        setHovered(name);
      }
      setTooltipPos({ x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
    }
  }, [setHovered, setTooltipPos]);

  const handleOut = useCallback(() => {
    hoveredRef.current = null;
    setHovered(null);
    document.body.style.cursor = 'default';
  }, [setHovered]);

  return (
    <group ref={groupRef}>
      <primitive
        object={preparedScene}
        onPointerOver={handleOver}
        onPointerMove={handleMove}
        onPointerOut={handleOut}
      />
    </group>
  );
}

/* ─── Particles ─── */
function Particles({ count = 100 }) {
  const ref = useRef();
  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 12,
      y: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 12,
      speed: 0.1 + Math.random() * 0.35,
      offset: Math.random() * Math.PI * 2,
    })), [count]);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    data.forEach((p, i) => { a[i*3]=p.x; a[i*3+1]=p.y; a[i*3+2]=p.z; });
    return a;
  }, [count, data]);

  useFrame((state) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;
    data.forEach((p, i) => {
      arr[i*3]   = p.x + Math.sin(t * p.speed + p.offset) * 0.5;
      arr[i*3+1] = p.y + Math.cos(t * p.speed * 0.7 + p.offset) * 0.5;
      arr[i*3+2] = p.z + Math.sin(t * p.speed * 0.5 + p.offset) * 0.3;
    });
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#1e90ff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

/* ─── Tooltip Card ─── */
function Tooltip({ hovered, pos }) {
  const region = BRAIN_REGIONS[hovered];
  if (!region) return null;

  const style = {
    position: 'fixed',
    left: pos.x + 20,
    top: pos.y - 10,
    zIndex: 1000,
    pointerEvents: 'none',
    animation: 'tooltipIn 0.25s ease forwards',
  };

  return (
    <div className="brain-tooltip" style={style}>
      <div className="brain-tooltip__header">
        <span className="brain-tooltip__icon" style={{ display: 'flex', alignItems: 'center', marginRight: '6px' }}>
          <Icon name={region.icon} size={18} color={region.color} />
        </span>
        <span className="brain-tooltip__name">{region.name}</span>
        <span className="brain-tooltip__dot" style={{ background: region.color }} />
      </div>
      <p className="brain-tooltip__desc">{region.desc}</p>
      <div className="brain-tooltip__bar">
        <div className="brain-tooltip__bar-fill" style={{ background: region.color }} />
      </div>
    </div>
  );
}

/* ─── Loading ─── */
function LoadingFallback() {
  return (
    <div className="brain3d-loading">
      <div className="brain3d-spinner" />
      <span>Initializing Neural Scan...</span>
    </div>
  );
}

/* ─── Main Export ─── */
export default function Brain3D() {
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/brain_areas.glb', { method: 'HEAD' })
      .then((r) => { if (!r.ok) setError(true); })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="brain-hero-canvas">
        <div className="brain3d-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Icon name="brain" size={48} color="rgba(255,255,255,0.4)" />
          <span>3D Model unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="brain-hero-canvas">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0.3, 6.0], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
          raycaster={{ params: { Points: { threshold: 0.1 } } }}
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[-5, 4, -6]} intensity={0.5} color="#448aff" />
          <pointLight position={[0, -4, 2]} intensity={0.3} color="#00e5ff" />
          <spotLight position={[0, 8, 0]} angle={0.3} penumbra={1} intensity={0.6} color="#e0e7ff" />

          <Environment preset="night" />

          <BrainMesh setHovered={setHovered} setTooltipPos={setTooltipPos} />


          <Particles />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3.5}
            maxPolarAngle={Math.PI / 1.5}
            dampingFactor={0.04}
            enableDamping
            rotateSpeed={0.4}
          />
        </Canvas>
      </Suspense>

      {/* Tooltip overlay */}
      <Tooltip hovered={hovered} pos={tooltipPos} />

      {/* Interaction hint */}
      <div className={`brain-hint ${hovered ? 'brain-hint--hidden' : ''}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M2 12h20"/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10A15 15 0 0112 2z"/></svg>
        <span>Hover & drag to explore brain regions</span>
      </div>
    </div>
  );
}

useGLTF.preload('/brain_areas.glb');
