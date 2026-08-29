import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Sun, 
  Moon, 
  Compass, 
  Layers, 
  Eye, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  MapPin, 
  Building2, 
  RotateCcw, 
  Camera, 
  Download, 
  HelpCircle, 
  TreePine, 
  Car, 
  FileText,
  CreditCard,
  PhoneCall,
  X,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

/**
 * ThreeDModelViewer: High-Fidelity Three.js 3D Digital Twin & Plotted Masterplan Simulator
 */
export default function ThreeDModelViewer({
  township,
  selectedPlot = null,
  onSelectPlot,
  onBookPlot,
  onScheduleVisit,
  onVerifyDocs,
  height = '680px'
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const sunLightRef = useRef(null);
  const ambientLightRef = useRef(null);
  const hemiLightRef = useRef(null);
  const plotMeshesGroupRef = useRef(null);
  const villaGroupRef = useRef(null);
  const treeGroupRef = useRef(null);
  const labelGroupRef = useRef(null);
  const utilitiesGroupRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Interactive UI State
  const [timeOfDay, setTimeOfDay] = useState(10.5); // 10:30 AM
  const [cameraPreset, setCameraPreset] = useState('orbit'); // 'orbit' | 'top' | 'street' | 'focus'
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Layer Toggles
  const [showVillas, setShowVillas] = useState(true);
  const [showTrees, setShowTrees] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showVastuGrid, setShowVastuGrid] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  const [showUtilities, setShowUtilities] = useState(false);
  const [filterFacing, setFilterFacing] = useState('ALL'); // 'ALL' | 'East' | 'North' | 'West' | 'South'

  // Plots data
  const plots = useMemo(() => township?.plots || [], [township]);

  // Map plot ID to coordinates and dimensions in 3D scene
  const plotLayoutMap = useMemo(() => {
    const map = new Map();
    const cols = 5;
    const spacingX = 14;
    const spacingZ = 18;

    plots.forEach((p, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = (col - (cols - 1) / 2) * spacingX;
      const z = (row - 1.5) * spacingZ;
      map.set(p.id, { x, z, row, col, plot: p });
    });
    return map;
  }, [plots]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 680;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712'); // Dark slate background
    scene.fog = new THREE.FogExp2('#030712', 0.008);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.5, 800);
    camera.position.set(70, 65, 85);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // Stay above ground
    controls.minDistance = 20;
    controls.maxDistance = 250;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.6);
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Solar Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(60, 75, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 300;
    const d = 70;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 6. Base Township Ground & Road Infrastructure
    const groundGroup = new THREE.Group();

    // Large grass base
    const terrainGeo = new THREE.PlaneGeometry(350, 350, 32, 32);
    const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0x06281e, // Deep emerald lawn
      roughness: 0.88,
      metalness: 0.08
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.05;
    terrain.receiveShadow = true;
    groundGroup.add(terrain);

    // Subtle Boundary Fencing Wall around perimeter
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(160, 2.5, 1), wallMat);
    wallNorth.position.set(0, 1.25, -60);
    wallNorth.castShadow = true;
    groundGroup.add(wallNorth);

    const wallSouth = new THREE.Mesh(new THREE.BoxGeometry(160, 2.5, 1), wallMat);
    wallSouth.position.set(0, 1.25, 60);
    wallSouth.castShadow = true;
    groundGroup.add(wallSouth);

    // 60ft Main Central Boulevard (Asphalt)
    const mainRoadGeo = new THREE.PlaneGeometry(16, 120);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.02, 0);
    mainRoad.receiveShadow = true;
    groundGroup.add(mainRoad);

    // Main Road Center Dashed Line
    const centerLineGeo = new THREE.PlaneGeometry(0.3, 115);
    const centerLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const centerLine = new THREE.Mesh(centerLineGeo, centerLineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.04, 0);
    groundGroup.add(centerLine);

    // 40ft Cross Avenues (Horizontal Connecting Roads)
    [-32, 0, 32].forEach((crossZ) => {
      const crossRoadGeo = new THREE.PlaneGeometry(130, 10);
      const crossRoad = new THREE.Mesh(crossRoadGeo, roadMat);
      crossRoad.rotation.x = -Math.PI / 2;
      crossRoad.position.set(0, 0.02, crossZ);
      crossRoad.receiveShadow = true;
      groundGroup.add(crossRoad);

      // Yellow Pedestrian Crossing Stripes
      for (let s = -5; s <= 5; s += 2) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(s, 0.04, crossZ);
        groundGroup.add(stripe);
      }
    });

    // Paved Sidewalk Curbs
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    [-9, 9].forEach((cx) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 120), curbMat);
      curb.position.set(cx, 0.15, 0);
      curb.receiveShadow = true;
      groundGroup.add(curb);
    });

    // Grand Entrance Archway & Security Kiosk
    const archGroup = createEntranceArch();
    archGroup.position.set(0, 0, 58);
    groundGroup.add(archGroup);

    // Central Community Clubhouse & Swimming Pool
    const clubhouseGroup = createClubhouseFacility();
    clubhouseGroup.position.set(-45, 0, -45);
    groundGroup.add(clubhouseGroup);

    // Central Park & Gazebo Zone
    const parkGroup = createCentralParkZone();
    parkGroup.position.set(45, 0, -45);
    groundGroup.add(parkGroup);

    // Ground Vastu Compass
    const vastuCompass = createMasterVastuCompass();
    vastuCompass.position.set(0, 0.06, 0);
    groundGroup.add(vastuCompass);

    scene.add(groundGroup);

    // 7. Dynamic Plot Parcels Group
    const plotMeshesGroup = new THREE.Group();
    scene.add(plotMeshesGroup);
    plotMeshesGroupRef.current = plotMeshesGroup;

    // 8. Villa Massing Concept Models Group
    const villaGroup = new THREE.Group();
    scene.add(villaGroup);
    villaGroupRef.current = villaGroup;

    // 9. Trees & Landscaping Group
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);
    treeGroupRef.current = treeGroup;

    // 10. Underground Utilities Group
    const utilitiesGroup = new THREE.Group();
    scene.add(utilitiesGroup);
    utilitiesGroupRef.current = utilitiesGroup;

    // 11. Plot Labels & Badges Group
    const labelGroup = new THREE.Group();
    scene.add(labelGroup);
    labelGroupRef.current = labelGroup;

    // Populate Trees along the boulevards
    [-11, 11].forEach((tx) => {
      for (let tz = -50; tz <= 45; tz += 15) {
        const tree = createTownshipTree(0.8 + Math.random() * 0.4);
        tree.position.set(tx, 0, tz);
        treeGroup.add(tree);
      }
    });

    // Populate Street Lamp Posts
    [-10, 10].forEach((lx) => {
      for (let lz = -45; lz <= 40; lz += 25) {
        const lamp = createTownshipStreetLamp();
        lamp.position.set(lx, 0, lz);
        treeGroup.add(lamp);
      }
    });

    // Build Underground Water & Power Grid
    createUndergroundUtilities(utilitiesGroup);

    // Animation Loop
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;
      animationFrameIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotating;
        controlsRef.current.autoRotateSpeed = 1.0;
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Move for Raycaster (Hover Plot)
    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      setCursorPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });

      if (!cameraRef.current || !plotMeshesGroupRef.current) return;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(plotMeshesGroupRef.current.children, true);

      if (intersects.length > 0) {
        // Find ancestor plot mesh with userData
        let target = intersects[0].object;
        while (target && !target.userData?.plotId && target.parent) {
          target = target.parent;
        }
        if (target && target.userData?.plot) {
          setHoveredPlot(target.userData.plot);
          container.style.cursor = 'pointer';
          return;
        }
      }

      setHoveredPlot(null);
      container.style.cursor = 'grab';
    };

    // Click Plot Selection
    const handleClick = (event) => {
      const rect = container.getBoundingClientRect();
      const clickX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (!cameraRef.current || !plotMeshesGroupRef.current) return;

      const clickRaycaster = new THREE.Raycaster();
      clickRaycaster.setFromCamera(new THREE.Vector2(clickX, clickY), cameraRef.current);
      const intersects = clickRaycaster.intersectObjects(plotMeshesGroupRef.current.children, true);

      if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target && !target.userData?.plotId && target.parent) {
          target = target.parent;
        }
        if (target && target.userData?.plot) {
          if (onSelectPlot) onSelectPlot(target.userData.plot);
        }
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 680;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current?.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Rebuild 3D Plot Parcels & Villas when plots, filters, or selected plot changes
  useEffect(() => {
    if (!plotMeshesGroupRef.current || !villaGroupRef.current || !labelGroupRef.current) return;

    const plotGroup = plotMeshesGroupRef.current;
    const vGroup = villaGroupRef.current;
    const lGroup = labelGroupRef.current;

    // Clear old meshes
    clearThreeGroup(plotGroup);
    clearThreeGroup(vGroup);
    clearThreeGroup(lGroup);

    const isEast = (p) => (p.facing || '').toLowerCase().includes('east');
    const isNorth = (p) => (p.facing || '').toLowerCase().includes('north');

    plots.forEach((plot) => {
      // Facing Filter check
      if (filterFacing !== 'ALL') {
        const matches = (plot.facing || '').toLowerCase().includes(filterFacing.toLowerCase());
        if (!matches) return;
      }

      const layout = plotLayoutMap.get(plot.id);
      if (!layout) return;

      const isSelected = selectedPlot?.id === plot.id;
      const isAvailable = plot.status === 'Available';
      const isReserved = plot.status === 'Reserved';

      const plotWidth = 11;
      const plotDepth = 15;

      // Plot Mesh Base
      const singlePlotGroup = new THREE.Group();
      singlePlotGroup.position.set(layout.x, 0, layout.z);
      singlePlotGroup.userData = { plotId: plot.id, plot };

      // Status-specific base color
      let slabColor = 0x065f46; // Emerald for Available
      let edgeColor = 0x34d399;

      if (isReserved) {
        slabColor = 0x78350f; // Amber
        edgeColor = 0xfbbf24;
      } else if (!isAvailable && !isReserved) {
        slabColor = 0x881337; // Rose for Sold
        edgeColor = 0xf43f5e;
      }

      if (isSelected) {
        slabColor = 0x047857;
        edgeColor = 0x6ee7b7;
      }

      // 3D Ground Slab for Plot
      const slabGeo = new THREE.BoxGeometry(plotWidth, 0.4, plotDepth);
      const slabMat = new THREE.MeshStandardMaterial({
        color: slabColor,
        roughness: 0.7,
        metalness: 0.1,
        emissive: isSelected ? 0x064e3b : 0x000000,
        emissiveIntensity: isSelected ? 0.6 : 0
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.y = 0.2;
      slabMesh.receiveShadow = true;
      slabMesh.userData = { plotId: plot.id, plot };
      singlePlotGroup.add(slabMesh);

      // Outer Perimeter Border Wireframe / Ribbon
      const edges = new THREE.EdgesGeometry(slabGeo);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: edgeColor, 
        linewidth: isSelected ? 3 : 1 
      });
      const borderLines = new THREE.LineSegments(edges, lineMat);
      borderLines.position.copy(slabMesh.position);
      singlePlotGroup.add(borderLines);

      // Corner Boundary Granite Survey Stones
      const halfW = plotWidth / 2;
      const halfD = plotDepth / 2;
      [
        [-halfW, -halfD],
        [halfW, -halfD],
        [-halfW, halfD],
        [halfW, halfD]
      ].forEach(([cx, cz]) => {
        const stone = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
        );
        stone.position.set(cx, 0.4, cz);
        stone.castShadow = true;

        const tip = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 0.3, 8),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        tip.position.set(0, 0.4, 0);
        stone.add(tip);

        singlePlotGroup.add(stone);
      });

      // Selection Glow Pillar
      if (isSelected) {
        const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 16, 16);
        const pillarMat = new THREE.MeshBasicMaterial({
          color: 0x34d399,
          transparent: true,
          opacity: 0.5
        });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(0, 8, 0);
        singlePlotGroup.add(pillar);

        // Pulsing top marker diamond
        const diamond = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.2, 0),
          new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 0.8 })
        );
        diamond.position.set(0, 16.5, 0);
        singlePlotGroup.add(diamond);
      }

      plotGroup.add(singlePlotGroup);

      // 3D Villa Concept Massing on Plots (if enabled)
      if (showVillas) {
        const villaMesh = createTownshipVillaMassing(plot, isSelected);
        villaMesh.position.set(layout.x, 0.4, layout.z);
        vGroup.add(villaMesh);
      }

      // Plot Number Billboard Tag (if enabled)
      if (showLabels) {
        const labelSprite = createPlotNumberSprite(plot.plotNumber || plot.number || `P-${plot.id}`, isSelected, plot.status);
        labelSprite.position.set(layout.x, 2.8, layout.z + 5.5);
        lGroup.add(labelSprite);
      }
    });
  }, [plots, plotLayoutMap, selectedPlot, showVillas, showLabels, filterFacing]);

  // Update Sun Lighting Angle & Colors based on timeOfDay
  useEffect(() => {
    if (!sunLightRef.current || !ambientLightRef.current || !hemiLightRef.current) return;

    const normalizedTime = (timeOfDay - 6) / 12.5; // 0 (6am) to 1 (6:30pm)
    const angle = normalizedTime * Math.PI; // 0 to PI
    const sunRadius = 110;

    const posX = Math.cos(angle) * sunRadius;
    const posY = Math.sin(angle) * 85 + 8;
    const posZ = Math.sin(angle * 0.5) * 35;

    sunLightRef.current.position.set(posX, posY, posZ);
    sunLightRef.current.castShadow = showShadows;

    if (timeOfDay < 8.5) {
      // Golden Morning (East)
      sunLightRef.current.color.setHex(0xffe4b5);
      sunLightRef.current.intensity = 1.9;
      ambientLightRef.current.color.setHex(0xfef3c7);
      ambientLightRef.current.intensity = 0.45;
      hemiLightRef.current.color.setHex(0xfde68a);
    } else if (timeOfDay >= 8.5 && timeOfDay <= 15) {
      // Bright Noon Daylight
      sunLightRef.current.color.setHex(0xffffff);
      sunLightRef.current.intensity = 2.4;
      ambientLightRef.current.color.setHex(0xffffff);
      ambientLightRef.current.intensity = 0.55;
      hemiLightRef.current.color.setHex(0xdbeafe);
    } else if (timeOfDay > 15 && timeOfDay <= 17.5) {
      // Warm Afternoon
      sunLightRef.current.color.setHex(0xfdba74);
      sunLightRef.current.intensity = 2.0;
      ambientLightRef.current.color.setHex(0xfed7aa);
      ambientLightRef.current.intensity = 0.45;
      hemiLightRef.current.color.setHex(0xfcd34d);
    } else {
      // Golden Hour Sunset
      sunLightRef.current.color.setHex(0xf43f5e);
      sunLightRef.current.intensity = 1.4;
      ambientLightRef.current.color.setHex(0x38bdf8);
      ambientLightRef.current.intensity = 0.35;
      hemiLightRef.current.color.setHex(0xa855f7);
    }
  }, [timeOfDay, showShadows]);

  // Update Group Visibilities
  useEffect(() => {
    if (treeGroupRef.current) treeGroupRef.current.visible = showTrees;
    if (utilitiesGroupRef.current) utilitiesGroupRef.current.visible = showUtilities;
  }, [showTrees, showUtilities]);

  // Camera Presets Controller
  const handleSetCameraPreset = (preset) => {
    setCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;

    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (preset === 'top') {
      // 2D Orthographic-like True North Masterplan View
      cam.position.set(0, 130, 0.1);
      ctrl.target.set(0, 0, 0);
    } else if (preset === 'street') {
      // Boulevard Pedestrian View
      cam.position.set(0, 3.5, 52);
      ctrl.target.set(0, 4, 0);
    } else if (preset === 'focus' && selectedPlot) {
      // Zoom right to selected plot
      const layout = plotLayoutMap.get(selectedPlot.id);
      if (layout) {
        cam.position.set(layout.x + 20, 16, layout.z + 24);
        ctrl.target.set(layout.x, 3, layout.z);
      }
    } else {
      // Default 3D Orbit Overview
      cam.position.set(70, 65, 85);
      ctrl.target.set(0, 0, 0);
    }
    ctrl.update();
  };

  // High-Res Screenshot Export
  const handleTakeSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `PlotFlow_3D_${township?.name || 'Township'}_Twin.png`;
    link.href = dataUrl;
    link.click();
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!mountRef.current) return;
    if (!isFullscreen) {
      if (mountRef.current.requestFullscreen) {
        mountRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Format Time Display
  const hours = Math.floor(timeOfDay);
  const minutes = timeOfDay % 1 !== 0 ? '30' : '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours;
  const timeFormatted = `${displayHour}:${minutes} ${ampm}`;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
      {/* 3D WebGL Header Controls */}
      <div className="bg-slate-900/95 backdrop-blur-md p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-white tracking-tight">
                3D Interactive Digital Twin & Solar Simulator
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold font-mono">
                Three.js Physics
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {township?.name || 'Plotted Community'} • {plots.length} Plotted Parcels • Real Sun-Path Lighting
            </p>
          </div>
        </div>

        {/* Camera Views Selector */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center space-x-1">
          <button
            onClick={() => handleSetCameraPreset('orbit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              cameraPreset === 'orbit' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D Orbit</span>
          </button>

          <button
            onClick={() => handleSetCameraPreset('top')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              cameraPreset === 'top' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Masterplan Plan</span>
          </button>

          <button
            onClick={() => handleSetCameraPreset('street')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              cameraPreset === 'street' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Boulevard Walk</span>
          </button>

          {selectedPlot && (
            <button
              onClick={() => handleSetCameraPreset('focus')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                cameraPreset === 'focus' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zoom to Plot</span>
            </button>
          )}
        </div>

        {/* Action Tools */}
        <div className="flex items-center space-x-2">
          {/* Facing Filter */}
          <select
            value={filterFacing}
            onChange={(e) => setFilterFacing(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Facings</option>
            <option value="East">East Facing (Purva)</option>
            <option value="North">North Facing (Uttara)</option>
            <option value="West">West Facing (Pashchima)</option>
            <option value="South">South Facing (Dakshina)</option>
          </select>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title="Toggle 360° Slow Cinematic Spin"
            className={`p-2 rounded-xl border transition ${
              isAutoRotating ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* High Res Snapshot */}
          <button
            onClick={handleTakeSnapshot}
            title="Export High-Res 3D Blueprint PNG"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen Canvas"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount Frame */}
      <div 
        ref={mountRef}
        style={{ height }}
        className="w-full relative cursor-grab active:cursor-grabbing bg-slate-950 overflow-hidden select-none"
      >
        {/* Floating Directional Compass HUD */}
        <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 px-3.5 flex items-center space-x-3 text-xs shadow-xl pointer-events-none">
          <div className="relative w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center">
            <span className="absolute top-0 text-[8px] font-black text-rose-400">N</span>
            <span className="absolute right-0.5 text-[8px] font-black text-amber-400">E</span>
            <span className="absolute bottom-0 text-[8px] font-black text-slate-500">S</span>
            <span className="absolute left-0.5 text-[8px] font-black text-slate-500">W</span>
            <div className="w-1 h-4 bg-gradient-to-t from-slate-600 to-rose-500 rounded-full" />
          </div>
          <div>
            <span className="font-bold text-white block">True North Vastu</span>
            <span className="text-[10px] text-emerald-400 font-semibold">100% Survey Synchronized</span>
          </div>
        </div>

        {/* Legend Status HUD */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl px-3.5 py-2 flex items-center space-x-3 text-[11px] shadow-xl pointer-events-none">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Available</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Reserved</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Sold</span>
          </span>
        </div>

        {/* Hover Tooltip Overlay in 3D */}
        {hoveredPlot && (
          <div 
            className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-3 shadow-2xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full mb-3 animate-fadeIn"
            style={{ left: cursorPos.x, top: cursorPos.y }}
          >
            <div className="flex items-center justify-between space-x-3">
              <span className="font-black text-white text-sm">
                {hoveredPlot.plotNumber || hoveredPlot.number || `Plot ${hoveredPlot.id}`}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                hoveredPlot.status === 'Available'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : hoveredPlot.status === 'Reserved'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {hoveredPlot.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-300">
              <span>{hoveredPlot.dimension || hoveredPlot.dimensions || '30x40 ft'}</span> • <span className="text-amber-400 font-bold">{hoveredPlot.price}</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
              <Compass className="w-3 h-3" />
              <span>{hoveredPlot.facing} ({hoveredPlot.vastuScore || 95}% Vastu)</span>
            </div>
            <div className="text-[9px] text-slate-400 border-t border-slate-800 pt-1">
              Click plot to select & launch 3D architect
            </div>
          </div>
        )}

        {/* Navigation Guidance Hints */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl px-3 py-1.5 text-[10px] text-slate-400 pointer-events-none flex items-center space-x-2">
          <span>🖱️ Left-Click + Drag: <strong>Orbit / Rotate</strong></span>
          <span>•</span>
          <span>Right-Click: <strong>Pan</strong></span>
          <span>•</span>
          <span>Scroll: <strong>Zoom In/Out</strong></span>
        </div>

        {/* Selected Plot Floating Card on Right */}
        {selectedPlot && (
          <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-4 shadow-2xl max-w-sm text-xs space-y-3 animate-slideUp">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Selected Plot Parcel</span>
                <h4 className="text-base font-black text-white">
                  {selectedPlot.plotNumber || selectedPlot.number || `Plot ${selectedPlot.id}`}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {selectedPlot.dimension || selectedPlot.dimensions || '30x40 ft'} • {selectedPlot.sqft || selectedPlot.sizeSqFt || 1200} sq.ft
                </p>
              </div>

              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                selectedPlot.status === 'Available'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : selectedPlot.status === 'Reserved'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {selectedPlot.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Price</span>
                <span className="font-bold text-amber-400 text-xs">{selectedPlot.price}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Orientation</span>
                <span className="font-bold text-emerald-400">{selectedPlot.facing}</span>
              </div>
            </div>

            {/* Quick Action Triggers */}
            <div className="flex items-center gap-2 pt-1">
              {selectedPlot.status === 'Available' && onBookPlot && (
                <button
                  onClick={() => onBookPlot(selectedPlot)}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Book Token</span>
                </button>
              )}

              {onScheduleVisit && (
                <button
                  onClick={() => onScheduleVisit(selectedPlot)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1"
                >
                  <Car className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Free Cab</span>
                </button>
              )}

              {onVerifyDocs && (
                <button
                  onClick={() => onVerifyDocs(selectedPlot)}
                  className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition"
                  title="Verify 30-Yr Legal Due Diligence Title Search"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sun-Path Timeline & 3D Layer Controls Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-4 space-y-3">
        {/* Top Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <span className="font-bold text-white block">Solar Shadow Trajectory</span>
              <span className="text-[11px] text-amber-300 font-mono font-bold">{timeFormatted}</span>
            </div>
          </div>

          {/* Layer Checkboxes */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 font-semibold">
            <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={showVillas}
                onChange={(e) => setShowVillas(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>3D Villa Models</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={showTrees}
                onChange={(e) => setShowTrees(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>Avenue Trees</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>Plot Badges</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={showShadows}
                onChange={(e) => setShowShadows(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>Live Shadows</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={showUtilities}
                onChange={(e) => setShowUtilities(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>Underground Utilities</span>
            </label>
          </div>
        </div>

        {/* Solar Slider Range */}
        <div className="relative pt-1">
          <input
            type="range"
            min="6"
            max="18.5"
            step="0.5"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-gradient-to-r from-amber-500 via-yellow-200 via-amber-400 to-rose-600 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-1">
            <span>6:00 AM (Sunrise East)</span>
            <span>9:00 AM</span>
            <span>12:00 PM (Zenith)</span>
            <span>3:00 PM</span>
            <span>6:30 PM (Sunset West)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// THREE.JS TOWNSHIP PROCEDURAL MESH HELPERS
// ----------------------------------------------------

/**
 * Safely dispose and clear children of a Three.js Group
 */
function clearThreeGroup(group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
  }
}

/**
 * Creates 3D Villa Concept Massing on a Plot
 */
function createTownshipVillaMassing(plot, isSelected) {
  const villa = new THREE.Group();

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.7, roughness: 0.1 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  // Ground floor mass (Width: 8, Height: 3.5, Depth: 9)
  const gMesh = new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 9), whiteMat);
  gMesh.position.set(0, 1.75, 0);
  gMesh.castShadow = true;
  gMesh.receiveShadow = true;
  villa.add(gMesh);

  // First Floor Cantilever
  const ffMesh = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.2, 8), whiteMat);
  ffMesh.position.set(0.5, 5.1, 0.5);
  ffMesh.castShadow = true;
  ffMesh.receiveShadow = true;
  villa.add(ffMesh);

  // Wood Louver screen accent
  const louver = new THREE.Mesh(new THREE.BoxGeometry(3, 2.8, 0.3), woodMat);
  louver.position.set(-2, 5.1, 4.6);
  louver.castShadow = true;
  villa.add(louver);

  // Glass Balcony
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 0.2), glassMat);
  balcony.position.set(1.5, 4.2, 4.6);
  villa.add(balcony);

  // Flat rooftop pergola
  const pergola = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 4), darkMetal);
  pergola.position.set(1, 7.0, 0);
  pergola.castShadow = true;
  villa.add(pergola);

  return villa;
}

/**
 * Creates HTML5 Canvas Sprite for Plot Number & Status
 */
function createPlotNumberSprite(text, isSelected, status) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background pill
  ctx.fillStyle = isSelected ? '#059669' : '#0f172a';
  ctx.strokeStyle = isSelected ? '#34d399' : (status === 'Available' ? '#10b981' : '#f59e0b');
  ctx.lineWidth = 6;

  // Round rect
  const r = 24;
  ctx.beginPath();
  ctx.moveTo(12 + r, 12);
  ctx.lineTo(244 - r, 12);
  ctx.quadraticCurveTo(244, 12, 244, 12 + r);
  ctx.lineTo(244, 116 - r);
  ctx.quadraticCurveTo(244, 116, 244 - r, 116);
  ctx.lineTo(12 + r, 116);
  ctx.quadraticCurveTo(12, 116, 12, 116 - r);
  ctx.lineTo(12, 12 + r);
  ctx.quadraticCurveTo(12, 12, 12 + r, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(4.5, 2.2, 1);
  return sprite;
}

/**
 * Creates Grand Entrance Archway
 */
function createEntranceArch() {
  const arch = new THREE.Group();

  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

  // Left Pillar
  const pLeft = new THREE.Mesh(new THREE.BoxGeometry(3, 10, 3), graniteMat);
  pLeft.position.set(-10, 5, 0);
  pLeft.castShadow = true;
  arch.add(pLeft);

  // Right Pillar
  const pRight = new THREE.Mesh(new THREE.BoxGeometry(3, 10, 3), graniteMat);
  pRight.position.set(10, 5, 0);
  pRight.castShadow = true;
  arch.add(pRight);

  // Top Crossbeam Beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(26, 2.5, 4), graniteMat);
  beam.position.set(0, 11, 0);
  beam.castShadow = true;
  arch.add(beam);

  // Gold Emblem
  const emblem = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.4, 16), goldMat);
  emblem.rotation.x = Math.PI / 2;
  emblem.position.set(0, 11, 2.2);
  arch.add(emblem);

  // Security Kiosk Booth
  const kiosk = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  kiosk.position.set(14, 2, 0);
  kiosk.castShadow = true;
  arch.add(kiosk);

  return arch;
}

/**
 * Creates Central Clubhouse & Swimming Pool
 */
function createClubhouseFacility() {
  const group = new THREE.Group();

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const poolMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.2 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });

  // Main Clubhouse Pavilion
  const club = new THREE.Mesh(new THREE.BoxGeometry(24, 7, 18), whiteMat);
  club.position.set(0, 3.5, 0);
  club.castShadow = true;
  club.receiveShadow = true;
  group.add(club);

  // Wooden Pool Deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 14), deckMat);
  deck.position.set(0, 0.2, 16);
  deck.receiveShadow = true;
  group.add(deck);

  // Sparkling Blue Infinity Pool
  const pool = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 10), poolMat);
  pool.position.set(0, 0.3, 16);
  group.add(pool);

  return group;
}

/**
 * Creates Central Park & Gazebo Zone
 */
function createCentralParkZone() {
  const group = new THREE.Group();

  const grassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });

  // Elevated Green Park Lawn Mound
  const lawn = new THREE.Mesh(new THREE.CylinderGeometry(16, 17, 0.6, 32), grassMat);
  lawn.position.set(0, 0.3, 0);
  lawn.receiveShadow = true;
  group.add(lawn);

  // Park Gazebo Pillars
  for (let a = 0; a < 6; a++) {
    const angle = (a / 6) * Math.PI * 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5, 8), woodMat);
    col.position.set(Math.cos(angle) * 5, 2.5, Math.sin(angle) * 5);
    col.castShadow = true;
    group.add(col);
  }

  // Gazebo Hexagonal Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 3, 6), woodMat);
  roof.position.set(0, 6.5, 0);
  roof.castShadow = true;
  group.add(roof);

  return group;
}

/**
 * Creates Master Vastu Compass on Ground Plane
 */
function createMasterVastuCompass() {
  const group = new THREE.Group();

  const ringGeo = new THREE.RingGeometry(12, 12.6, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  // North Pointer Needle
  const northGeo = new THREE.ConeGeometry(1.6, 10, 4);
  const northMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const north = new THREE.Mesh(northGeo, northMat);
  north.rotation.x = Math.PI / 2;
  north.position.set(0, 0.05, -5);
  group.add(north);

  return group;
}

/**
 * Creates Stylized Boulevard Tree
 */
function createTownshipTree(scale = 1) {
  const tree = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.35 * scale, 0.55 * scale, 4 * scale, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 2 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  const foliageColors = [0x15803d, 0x16a34a, 0x22c55e];
  const color = foliageColors[Math.floor(Math.random() * foliageColors.length)];
  const foliageMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });

  const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5 * scale, 1), foliageMat);
  f1.position.set(0, 4.8 * scale, 0);
  f1.castShadow = true;
  tree.add(f1);

  return tree;
}

/**
 * Creates Township Street Lamp
 */
function createTownshipStreetLamp() {
  const lamp = new THREE.Group();

  const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 10, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 5;
  pole.castShadow = true;
  lamp.add(pole);

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  bulb.position.set(0, 9.8, 1);
  lamp.add(bulb);

  return lamp;
}

/**
 * Creates Glowing Underground Water Reticulation & Power Cables
 */
function createUndergroundUtilities(group) {
  // Underground water pipelines (Blue Glowing Pipes)
  const pipeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 130, 8), pipeMat);
  p1.position.set(5, -1.2, 0);
  group.add(p1);

  // Underground Power Line (Yellow Glowing)
  const powerMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
  const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 130, 8), powerMat);
  p2.position.set(-5, -1.5, 0);
  group.add(p2);
}
