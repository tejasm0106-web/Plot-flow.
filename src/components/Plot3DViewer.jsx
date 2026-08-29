import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Sun, 
  Compass, 
  RotateCcw, 
  Layers, 
  Eye, 
  Maximize2, 
  Clock, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Camera, 
  Sliders,
  TreePine,
  ShieldCheck,
  Download
} from 'lucide-react';

/**
 * High-performance Three.js Single Plot & Villa Architectural Visualizer
 */
export default function Plot3DViewer({ 
  plot, 
  township, 
  height = '420px', 
  onBookToken,
  showControls = true 
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const sunLightRef = useRef(null);
  const ambientLightRef = useRef(null);
  const houseGroupRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // States
  const [villaTypology, setVillaTypology] = useState('modern'); // 'modern' | 'courtyard' | 'contemporary' | 'bare'
  const [timeOfDay, setTimeOfDay] = useState(10.5); // 10:30 AM
  const [showSetbacks, setShowSetbacks] = useState(true);
  const [showLandscaping, setShowLandscaping] = useState(true);
  const [showRooftopSolar, setShowRooftopSolar] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [cameraView, setCameraView] = useState('perspective'); // 'perspective' | 'front' | 'top' | 'isometric'

  const plotFacing = plot?.facing || 'East';
  const plotWidth = 30; // standard 30x40 or 30x50
  const plotDepth = 40;

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712'); // Deep slate dark
    scene.fog = new THREE.FogExp2('#030712', 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 500);
    camera.position.set(45, 35, 55);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Do not go below ground
    controls.minDistance = 15;
    controls.maxDistance = 150;
    controls.target.set(0, 4, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xbfdbfe, 0x1e293b, 0.5);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLight.position.set(30, 45, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    const d = 40;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 6. Base Environment Mesh (Road, Footpath, Grass Surrounding)
    const groundGroup = new THREE.Group();

    // Surrounding grass land
    const surroundingGeo = new THREE.PlaneGeometry(200, 200);
    const surroundingMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      roughness: 0.9,
      metalness: 0.1
    });
    const surroundingMesh = new THREE.Mesh(surroundingGeo, surroundingMat);
    surroundingMesh.rotation.x = -Math.PI / 2;
    surroundingMesh.position.y = -0.1;
    surroundingMesh.receiveShadow = true;
    groundGroup.add(surroundingMesh);

    // Front Asphalt Road (40ft Boulevard)
    const roadGeo = new THREE.PlaneGeometry(160, 24);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, 32);
    roadMesh.receiveShadow = true;
    groundGroup.add(roadMesh);

    // Road White dashed center line
    const dashedLineGeo = new THREE.PlaneGeometry(150, 0.4);
    const dashedLineMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
    const dashedLine = new THREE.Mesh(dashedLineGeo, dashedLineMat);
    dashedLine.rotation.x = -Math.PI / 2;
    dashedLine.position.set(0, 0.02, 32);
    groundGroup.add(dashedLine);

    // Pedestrian Paver Footpath
    const walkwayGeo = new THREE.BoxGeometry(160, 0.3, 5);
    const walkwayMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkway.position.set(0, 0.15, 18);
    walkway.receiveShadow = true;
    groundGroup.add(walkway);

    // Avenue street trees along the footpath
    [-45, -25, 25, 45].forEach((tx) => {
      const tree = createStylizedTree();
      tree.position.set(tx, 0, 18);
      groundGroup.add(tree);
    });

    // Street light poles
    [-35, 35].forEach((lx) => {
      const pole = createStreetLamp();
      pole.position.set(lx, 0, 16);
      groundGroup.add(pole);
    });

    scene.add(groundGroup);

    // 7. Plot Boundary Slabs & Boundary Pegs
    const plotBaseGroup = new THREE.Group();

    // Plot Earth / Lawn Slab
    const plotLawnGeo = new THREE.BoxGeometry(plotWidth, 0.4, plotDepth);
    const plotLawnMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Emerald lush green lawn
      roughness: 0.85,
      metalness: 0.05
    });
    const plotLawn = new THREE.Mesh(plotLawnGeo, plotLawnMat);
    plotLawn.position.set(0, 0.2, -4);
    plotLawn.receiveShadow = true;
    plotBaseGroup.add(plotLawn);

    // Plot Border Boundary Ribbon
    const borderEdges = new THREE.EdgesGeometry(plotLawnGeo);
    const borderLineMat = new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 2 });
    const borderLines = new THREE.LineSegments(borderEdges, borderLineMat);
    borderLines.position.copy(plotLawn.position);
    plotBaseGroup.add(borderLines);

    // 4 Corner Survey Boundary Stones (Granite stones with red tops)
    const halfW = plotWidth / 2;
    const halfD = plotDepth / 2;
    const cornerPositions = [
      [-halfW, -4 - halfD],
      [halfW, -4 - halfD],
      [-halfW, -4 + halfD],
      [halfW, -4 + halfD]
    ];

    cornerPositions.forEach(([cx, cz]) => {
      const stoneGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.4, 8);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(cx, 0.7, cz);
      stone.castShadow = true;

      // Red paint tip
      const capGeo = new THREE.ConeGeometry(0.36, 0.4, 8);
      const capMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(0, 0.7, 0);
      stone.add(cap);

      plotBaseGroup.add(stone);
    });

    // 3D Vastu Compass Inscribed on Ground
    const compassGroup = createGroundVastuCompass();
    compassGroup.position.set(0, 0.42, -4);
    plotBaseGroup.add(compassGroup);

    scene.add(plotBaseGroup);

    // 8. House Group (Dynamically rebuilt on typology change)
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);
    houseGroupRef.current = houseGroup;

    // Animation Render Loop
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;
      animationFrameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotating;
        controlsRef.current.autoRotateSpeed = 1.2;
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      resizeObserver.disconnect();
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update Architectural Model whenever typology or options change
  useEffect(() => {
    if (!houseGroupRef.current) return;
    const group = houseGroupRef.current;

    // Clear previous children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }

    if (villaTypology === 'bare') {
      // Show demarcated setbacks & grid
      const setbackGroup = createSetbackVisualizer(plotWidth, plotDepth);
      group.add(setbackGroup);
      return;
    }

    // Build chosen villa typology
    let villaMeshGroup;
    if (villaTypology === 'modern') {
      villaMeshGroup = createModernBiophilicVilla(showRooftopSolar, showLandscaping);
    } else if (villaTypology === 'courtyard') {
      villaMeshGroup = createLuxuryCourtyardVilla(showLandscaping);
    } else {
      villaMeshGroup = createContemporaryDuplexVilla(showLandscaping);
    }

    group.add(villaMeshGroup);

    if (showSetbacks) {
      const setbacks = createSetbackVisualizer(plotWidth, plotDepth);
      group.add(setbacks);
    }
  }, [villaTypology, showSetbacks, showLandscaping, showRooftopSolar]);

  // Update Sun Lighting based on timeOfDay (6 to 18.5)
  useEffect(() => {
    if (!sunLightRef.current || !ambientLightRef.current) return;

    const normalizedTime = (timeOfDay - 6) / 12.5; // 0 (6am) to 1 (6:30pm)
    const angle = normalizedTime * Math.PI; // 0 to PI
    const sunRadius = 65;

    // Calculate position: East (+X) to West (-X)
    const posX = Math.cos(angle) * sunRadius;
    const posY = Math.sin(angle) * 55 + 5;
    const posZ = Math.sin(angle * 0.5) * 20;

    sunLightRef.current.position.set(posX, posY, posZ);

    // Color of sun & ambient
    if (timeOfDay < 8.5) {
      // Golden Morning
      sunLightRef.current.color.setHex(0xffddaa);
      sunLightRef.current.intensity = 1.6;
      ambientLightRef.current.color.setHex(0xfef3c7);
      ambientLightRef.current.intensity = 0.45;
    } else if (timeOfDay >= 8.5 && timeOfDay <= 15) {
      // Bright Noon Daylight
      sunLightRef.current.color.setHex(0xffffff);
      sunLightRef.current.intensity = 2.0;
      ambientLightRef.current.color.setHex(0xffffff);
      ambientLightRef.current.intensity = 0.55;
    } else if (timeOfDay > 15 && timeOfDay <= 17.5) {
      // Warm Afternoon
      sunLightRef.current.color.setHex(0xfdba74);
      sunLightRef.current.intensity = 1.7;
      ambientLightRef.current.color.setHex(0xfed7aa);
      ambientLightRef.current.intensity = 0.45;
    } else {
      // Golden Sunset / Dusk
      sunLightRef.current.color.setHex(0xf43f5e);
      sunLightRef.current.intensity = 1.3;
      ambientLightRef.current.color.setHex(0x38bdf8);
      ambientLightRef.current.intensity = 0.35;
    }
  }, [timeOfDay]);

  // Camera presets
  const handleSetCameraView = (view) => {
    setCameraView(view);
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (view === 'front') {
      camera.position.set(0, 10, 50);
      controls.target.set(0, 5, 0);
    } else if (view === 'top') {
      camera.position.set(0, 75, 0.1);
      controls.target.set(0, 0, -4);
    } else if (view === 'isometric') {
      camera.position.set(40, 40, 40);
      controls.target.set(0, 4, -4);
    } else {
      camera.position.set(45, 35, 55);
      controls.target.set(0, 4, 0);
    }
    controls.update();
  };

  // Capture Screenshot of Canvas
  const handleTakeSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `PlotFlow_3D_${plot?.plotNumber || 'Plot'}_VillaPreview.png`;
    link.href = dataUrl;
    link.click();
  };

  // Format time display
  const hours = Math.floor(timeOfDay);
  const minutes = timeOfDay % 1 !== 0 ? '30' : '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours;
  const timeFormatted = `${displayHour}:${minutes} ${ampm}`;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
      {/* 3D Canvas Top Toolbar */}
      <div className="bg-slate-900/90 backdrop-blur-md p-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white tracking-tight">
            3D Villa & Plot Digital Twin
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
            Three.js WebGL
          </span>
        </div>

        {/* Typology Switcher */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center space-x-1">
          <button
            onClick={() => setVillaTypology('modern')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              villaTypology === 'modern' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Biophilic Villa
          </button>
          <button
            onClick={() => setVillaTypology('courtyard')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              villaTypology === 'courtyard' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Courtyard Estate
          </button>
          <button
            onClick={() => setVillaTypology('contemporary')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              villaTypology === 'contemporary' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Modern Duplex
          </button>
          <button
            onClick={() => setVillaTypology('bare')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              villaTypology === 'bare' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demarcated Plot
          </button>
        </div>

        {/* Tools */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title="Toggle 360° Auto-Rotation"
            className={`p-1.5 rounded-lg border transition ${
              isAutoRotating ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTakeSnapshot}
            title="Download High-Res 3D Render"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Mount Point */}
      <div 
        ref={mountRef} 
        style={{ height }}
        className="w-full relative cursor-grab active:cursor-grabbing bg-slate-950 overflow-hidden"
      >
        {/* Floating North & Vastu Indicator */}
        <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-2 px-3 flex items-center space-x-2 text-[11px] shadow-lg pointer-events-none">
          <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center relative">
            <span className="text-[7px] font-black text-rose-400 absolute top-0">N</span>
            <div className="w-0.5 h-3 bg-gradient-to-t from-slate-600 to-rose-500 rounded-full" />
          </div>
          <div>
            <span className="text-white font-bold block">{plotFacing} Facing</span>
            <span className="text-[9px] text-emerald-400">{plot?.vastuScore || 95}% Vastu Compliant</span>
          </div>
        </div>

        {/* Camera Views Selector */}
        <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-1 flex space-x-1 text-[10px]">
          <button
            onClick={() => handleSetCameraView('perspective')}
            className={`px-2 py-1 rounded font-bold transition ${cameraView === 'perspective' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Orbit
          </button>
          <button
            onClick={() => handleSetCameraView('isometric')}
            className={`px-2 py-1 rounded font-bold transition ${cameraView === 'isometric' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Iso
          </button>
          <button
            onClick={() => handleSetCameraView('front')}
            className={`px-2 py-1 rounded font-bold transition ${cameraView === 'front' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Front
          </button>
          <button
            onClick={() => handleSetCameraView('top')}
            className={`px-2 py-1 rounded font-bold transition ${cameraView === 'top' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Top
          </button>
        </div>

        {/* Interactive Overlay Hints */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl px-3 py-1.5 text-[10px] text-slate-400 pointer-events-none flex items-center space-x-2">
          <span>🖱️ Left-Click + Drag: <strong>Orbit</strong></span>
          <span>•</span>
          <span>Right-Click + Drag: <strong>Pan</strong></span>
          <span>•</span>
          <span>Scroll: <strong>Zoom</strong></span>
        </div>
      </div>

      {/* 3D Sun-Path & Feature Toggle Bar */}
      {showControls && (
        <div className="bg-slate-900/95 border-t border-slate-800 p-4 space-y-3">
          {/* Solar Time Slider */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="font-bold text-white">Sun-Path & Solar Shadows:</span>
              <span className="font-mono text-amber-300 font-bold">{timeFormatted}</span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSetbacks}
                  onChange={(e) => setShowSetbacks(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Setback Guides</span>
              </label>

              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLandscaping}
                  onChange={(e) => setShowLandscaping(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Lawn & Trees</span>
              </label>

              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRooftopSolar}
                  onChange={(e) => setShowRooftopSolar(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Solar PV</span>
              </label>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="6"
              max="18.5"
              step="0.5"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-amber-500 via-yellow-200 to-rose-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-medium mt-1">
              <span>6:00 AM (Sunrise East)</span>
              <span>10:30 AM (Morning)</span>
              <span>1:00 PM (Zenith)</span>
              <span>4:30 PM (Afternoon)</span>
              <span>6:30 PM (Sunset West)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// THREE.JS PROCEDURAL PROCEDURAL ASSET GENERATORS
// ----------------------------------------------------

/**
 * Creates Modern Biophilic 2-Storey Villa with Wood Louvers, Cantilever Balcony & Solar Roof
 */
function createModernBiophilicVilla(hasSolar = true, hasLawn = true) {
  const villa = new THREE.Group();

  // Materials
  const stuccoWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const woodLouver = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
  const glassTint = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.65, roughness: 0.1 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  const warmStone = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });

  // 1. Ground Floor Plinth & Core (Width: 20, Height: 7, Depth: 24)
  const gPlinth = new THREE.Mesh(new THREE.BoxGeometry(20, 0.6, 24), warmStone);
  gPlinth.position.set(0, 0.5, -4);
  gPlinth.receiveShadow = true;
  gPlinth.castShadow = true;
  villa.add(gPlinth);

  const gFloor = new THREE.Mesh(new THREE.BoxGeometry(18, 6.5, 22), stuccoWhite);
  gFloor.position.set(0, 3.8, -4);
  gFloor.castShadow = true;
  gFloor.receiveShadow = true;
  villa.add(gFloor);

  // Large Panoramic Living Room Glass Glazing
  const gGlass = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.4), glassTint);
  gGlass.position.set(2, 3.5, 7.1);
  villa.add(gGlass);

  // Teak Wood Entry Door & Portico
  const door = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 0.4), woodLouver);
  door.position.set(-6, 3.5, 7.1);
  villa.add(door);

  const porticoSlab = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 6), darkMetal);
  porticoSlab.position.set(-5, 6.5, 9);
  porticoSlab.castShadow = true;
  villa.add(porticoSlab);

  const porticoPillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 0.5), darkMetal);
  porticoPillar.position.set(-8, 3.2, 11);
  porticoPillar.castShadow = true;
  villa.add(porticoPillar);

  // 2. First Floor Cantilever Massing (Width: 21, Height: 6.5, Depth: 20)
  const ffFloor = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 20), stuccoWhite);
  ffFloor.position.set(-0.5, 9.8, -2.5);
  ffFloor.castShadow = true;
  ffFloor.receiveShadow = true;
  villa.add(ffFloor);

  // Master Bedroom Cantilevered Glass Balcony
  const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 5), darkMetal);
  balconySlab.position.set(2, 7.0, 9);
  balconySlab.castShadow = true;
  villa.add(balconySlab);

  const balconyGlass = new THREE.Mesh(new THREE.BoxGeometry(12, 2.2, 0.2), glassTint);
  balconyGlass.position.set(2, 8.2, 11.4);
  villa.add(balconyGlass);

  // Vertical Teak Louver Screen
  for (let i = -4; i <= 4; i += 1.2) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.5, 0.8), woodLouver);
    louver.position.set(-8 + i, 9.8, 7.7);
    louver.castShadow = true;
    villa.add(louver);
  }

  // 3. Terrace Garden & Parapet
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(20.4, 1.2, 20.4), stuccoWhite);
  parapet.position.set(-0.5, 13.2, -2.5);
  parapet.castShadow = true;
  villa.add(parapet);

  // Staircase Headroom & Pergola
  const headRoom = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 8), stuccoWhite);
  headRoom.position.set(-5, 15.5, -6);
  headRoom.castShadow = true;
  villa.add(headRoom);

  // Dark Metal Terrace Pergola
  for (let p = 0; p < 5; p++) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 10), darkMetal);
    beam.position.set(2 + p * 1.8, 16.5, -2);
    beam.castShadow = true;
    villa.add(beam);
  }

  // Solar Photovoltaic Panels
  if (hasSolar) {
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    for (let s = 0; s < 4; s++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.15, 2.2), solarMat);
      panel.position.set(3, 14.5, -7 + s * 2.8);
      panel.rotation.x = -0.25; // 15 deg tilt
      panel.castShadow = true;
      villa.add(panel);
    }
  }

  // Parked Premium EV in Porch
  const car = createStylizedCar();
  car.position.set(-6, 0.5, 9.5);
  villa.add(car);

  return villa;
}

/**
 * Creates Luxury Courtyard Villa with central open-to-sky atrium
 */
function createLuxuryCourtyardVilla(hasLandscaping = true) {
  const villa = new THREE.Group();

  const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.7 });
  const terracottaMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });

  // Perimeter wings around a central courtyard
  // West Wing
  const wWing = new THREE.Mesh(new THREE.BoxGeometry(6, 9, 24), sandstoneMat);
  wWing.position.set(-7, 4.5, -4);
  wWing.castShadow = true;
  wWing.receiveShadow = true;
  villa.add(wWing);

  // East Wing
  const eWing = new THREE.Mesh(new THREE.BoxGeometry(6, 9, 24), sandstoneMat);
  eWing.position.set(7, 4.5, -4);
  eWing.castShadow = true;
  eWing.receiveShadow = true;
  villa.add(eWing);

  // North Rear Wing
  const nWing = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 6), sandstoneMat);
  nWing.position.set(0, 4.5, -13);
  nWing.castShadow = true;
  villa.add(nWing);

  // Terracotta Pitched Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(16, 4.5, 4), terracottaMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 11, -4);
  roof.castShadow = true;
  villa.add(roof);

  // Central Courtyard Greenery Tree
  const atriumTree = createStylizedTree(3.5, 0x15803d);
  atriumTree.position.set(0, 0.4, -4);
  villa.add(atriumTree);

  // Front Verandah Pillars & Wooden Lattice
  for (let p = -5; p <= 5; p += 2.5) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 7, 12), darkWood);
    col.position.set(p, 3.5, 7.5);
    col.castShadow = true;
    villa.add(col);
  }

  return villa;
}

/**
 * Creates Contemporary Compact Duplex Villa
 */
function createContemporaryDuplexVilla(hasLandscaping = true) {
  const villa = new THREE.Group();

  const grayMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
  const charcoalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6 });

  // Main block
  const main = new THREE.Mesh(new THREE.BoxGeometry(18, 11, 20), grayMat);
  main.position.set(0, 5.5, -4);
  main.castShadow = true;
  main.receiveShadow = true;
  villa.add(main);

  // Charcoal geometric accent frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 5), charcoalMat);
  frame.position.set(2.5, 8, 5);
  frame.castShadow = true;
  villa.add(frame);

  const glassWindow = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 0.2), glassMat);
  glassWindow.position.set(2.5, 8, 7.6);
  villa.add(glassWindow);

  return villa;
}

/**
 * Creates Setback Guidelines (BMRDA / BBMP Standard bylaw offsets)
 */
function createSetbackVisualizer(w, d) {
  const group = new THREE.Group();

  // Front setback: 10ft, Rear: 5ft, Sides: 4ft
  const frontSb = 6;
  const rearSb = 4;
  const sideSb = 3.5;

  const buildableW = w - (sideSb * 2);
  const buildableD = d - (frontSb + rearSb);

  const setbackGeo = new THREE.PlaneGeometry(buildableW, buildableD);
  const setbackMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(setbackGeo, setbackMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.25, -4 - (frontSb - rearSb) / 2);
  group.add(mesh);

  const edges = new THREE.EdgesGeometry(setbackGeo);
  const lineMat = new THREE.LineDashedMaterial({ color: 0x34d399, dashSize: 1, gapSize: 0.5 });
  const lines = new THREE.LineSegments(edges, lineMat);
  lines.computeLineDistances();
  lines.rotation.x = -Math.PI / 2;
  lines.position.copy(mesh.position);
  group.add(lines);

  return group;
}

/**
 * Creates 3D Ground Vastu Compass
 */
function createGroundVastuCompass() {
  const group = new THREE.Group();

  const ringGeo = new THREE.RingGeometry(5.5, 5.8, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  // Direction Pointer Needles
  const northNeedleGeo = new THREE.ConeGeometry(0.8, 5, 4);
  const northMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const northNeedle = new THREE.Mesh(northNeedleGeo, northMat);
  northNeedle.rotation.x = Math.PI / 2;
  northNeedle.position.set(0, 0.05, -2.5);
  group.add(northNeedle);

  return group;
}

/**
 * Creates Stylized 3D Tree
 */
function createStylizedTree(scale = 1, foliageColor = 0x16a34a) {
  const tree = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 3 * scale, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.5 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  // Foliage Spheres
  const foliageMat = new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.8 });
  const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2 * scale, 1), foliageMat);
  f1.position.set(0, 3.8 * scale, 0);
  f1.castShadow = true;
  tree.add(f1);

  const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4 * scale, 1), foliageMat);
  f2.position.set(0.8 * scale, 4.8 * scale, 0.3 * scale);
  f2.castShadow = true;
  tree.add(f2);

  return tree;
}

/**
 * Creates Stylized Street Lamp Post with Night Glow
 */
function createStreetLamp() {
  const lamp = new THREE.Group();

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 9, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 4.5;
  pole.castShadow = true;
  lamp.add(pole);

  // Arm & Light Fixture
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2), poleMat);
  arm.position.set(0, 8.8, 0.8);
  lamp.add(arm);

  const fixture = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.4, 8), poleMat);
  fixture.position.set(0, 8.7, 1.7);
  lamp.add(fixture);

  const lightBulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  lightBulb.position.set(0, 8.5, 1.7);
  lamp.add(lightBulb);

  return lamp;
}

/**
 * Creates Stylized EV Vehicle for Car Porch
 */
function createStylizedCar() {
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

  // Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 8.5), bodyMat);
  chassis.position.y = 0.9;
  chassis.castShadow = true;
  car.add(chassis);

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.1, 4.8), glassMat);
  cabin.position.set(0, 2.0, -0.4);
  cabin.castShadow = true;
  car.add(cabin);

  // Wheels
  [-2.2, 2.2].forEach(wx => {
    [-2.5, 2.5].forEach(wz => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.5, wz);
      car.add(wheel);
    });
  });

  return car;
}
