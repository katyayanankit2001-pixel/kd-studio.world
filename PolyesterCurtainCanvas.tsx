import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {CURTAIN_TEXTURE_IMAGE} from '../data/studioData';

export interface CurtainImpulse {
  nx: number; // normalized viewport X [0..1]
  ny: number; // normalized viewport Y [0..1]
  vx: number; // pointer delta X in normalized units
  vy: number; // pointer delta Y in normalized units
  poke: number; // extra Z-depth bounce impulse on tap/click
}

interface PolyesterCurtainCanvasProps {
  progressRef: React.MutableRefObject<number>;
  impulseQueueRef: React.MutableRefObject<CurtainImpulse[]>;
  active: boolean;
}

const COLS = 30;
const ROWS = 22;
const VERTEX_COUNT = (COLS + 1) * (ROWS + 1);

interface ClothPanel {
  side: -1 | 1; // -1 = left curtain, +1 = right curtain
  geometry: THREE.BufferGeometry;
  mesh: THREE.Mesh;
  pos: Float32Array;
  prev: Float32Array;
  restX: Float32Array;
  restY: Float32Array;
  restZ: Float32Array;
  restDx: number;
  restDy: number;
  restDiag: number;
  outerWallX: number;
}

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

// Fine procedural woven polyester twill micro-bump texture (no external file dependency)
function createPolyesterWeaveBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 2) {
      ctx.fillStyle = y % 4 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, y, size, 1);
    }
    for (let x = 0; x < size; x += 2) {
      ctx.fillStyle = x % 4 === 0 ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.10)';
      ctx.fillRect(x, 0, 1, size);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 16);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createClothPanel(
  side: -1 | 1,
  viewW: number,
  viewH: number,
  material: THREE.Material
): ClothPanel {
  // Extra-wide wall-to-wall oversized panels (74% of viewport width per side = 148% total)
  // so outer edges stay firmly off-screen with lush volume even during deep motion or bounce
  const panelW = viewW * 0.74;
  const panelH = viewH * 1.18;
  const geometry = new THREE.PlaneGeometry(panelW, panelH, COLS, ROWS);

  // Split the single wide real curtain photograph seamlessly across left [0..0.505] & right [0.495..1]
  // Eliminates any fake mirror-chevron seam in the middle!
  const uvAttr = geometry.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uvAttr.count; i++) {
    const rawU = uvAttr.getX(i); // 0..1 across this half-panel
    const mappedU = side === -1 ? rawU * 0.505 : 0.495 + rawU * 0.505;
    uvAttr.setX(i, mappedU);
  }
  uvAttr.needsUpdate = true;

  const pos = new Float32Array(VERTEX_COUNT * 3);
  const prev = new Float32Array(VERTEX_COUNT * 3);
  const restX = new Float32Array(VERTEX_COUNT);
  const restY = new Float32Array(VERTEX_COUNT);
  const restZ = new Float32Array(VERTEX_COUNT);

  const restDx = panelW / COLS;
  const restDy = panelH / ROWS;
  const restDiag = Math.hypot(restDx, restDy);

  // Left spans [-0.73*viewW .. +0.01*viewW]; Right spans [-0.01*viewW .. +0.73*viewW]
  const startX = side === -1 ? -viewW * 0.73 : -viewW * 0.01;
  const outerWallX = side === -1 ? -viewW * 0.73 : viewW * 0.73;
  const topY = viewH * 0.56;

  for (let r = 0; r <= ROWS; r++) {
    const vNorm = r / ROWS;
    const y = topY - vNorm * panelH;
    for (let c = 0; c <= COLS; c++) {
      const idx = r * (COLS + 1) + c;
      const uNorm = c / COLS;
      const x = startX + uNorm * panelW;

      // Subtle, authentic vertical 3D pleat relief aligned with vertical hanging fabric
      const pleatWave = Math.sin(uNorm * Math.PI * 12) * (0.12 + vNorm * 0.05);
      const z = pleatWave;

      const i3 = idx * 3;
      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      prev[i3] = x;
      prev[i3 + 1] = y;
      prev[i3 + 2] = z;

      restX[idx] = x;
      restY[idx] = y;
      restZ[idx] = z;
    }
  }

  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  (posAttr.array as Float32Array).set(pos);
  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  // Tiny Z overlap separation eliminates center-seam Z-fighting (just like real overlapping drapes)
  mesh.position.z = side === 1 ? 0.03 : 0;

  return {
    side,
    geometry,
    mesh,
    pos,
    prev,
    restX,
    restY,
    restZ,
    restDx,
    restDy,
    restDiag,
    outerWallX,
  };
}

function solveDistanceConstraint(
  pos: Float32Array,
  iA: number,
  iB: number,
  restDist: number,
  pinA: boolean,
  pinB: boolean,
  stiffness: number
) {
  const a3 = iA * 3;
  const b3 = iB * 3;
  const dx = pos[b3] - pos[a3];
  const dy = pos[b3 + 1] - pos[a3 + 1];
  const dz = pos[b3 + 2] - pos[a3 + 2];
  const distSq = dx * dx + dy * dy + dz * dz;
  if (distSq < 1e-8) return;
  const dist = Math.sqrt(distSq);
  const diff = ((dist - restDist) / dist) * stiffness;

  if (pinA && pinB) return;
  if (pinA) {
    pos[b3] -= dx * diff;
    pos[b3 + 1] -= dy * diff;
    pos[b3 + 2] -= dz * diff;
  } else if (pinB) {
    pos[a3] += dx * diff;
    pos[a3 + 1] += dy * diff;
    pos[a3 + 2] += dz * diff;
  } else {
    const half = diff * 0.5;
    pos[a3] += dx * half;
    pos[a3 + 1] += dy * half;
    pos[a3 + 2] += dz * half;
    pos[b3] -= dx * half;
    pos[b3 + 1] -= dy * half;
    pos[b3 + 2] -= dz * half;
  }
}

export function PolyesterCurtainCanvas({
  progressRef,
  impulseQueueRef,
  active,
}: PolyesterCurtainCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<boolean>(active);
  activeRef.current = active;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = Math.max(1, mount.clientWidth || window.innerWidth);
    const height = Math.max(1, mount.clientHeight || window.innerHeight);

    const scene = new THREE.Scene();

    const fov = 36;
    const camZ = 12;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 60);
    camera.position.set(0, 0, camZ);
    camera.lookAt(0, 0, 0);

    const calcViewBounds = (w: number, h: number) => {
      const viewH = 2 * camZ * Math.tan(THREE.MathUtils.degToRad(fov * 0.5));
      const viewW = viewH * (w / h);
      return {viewW, viewH};
    };

    let {viewW, viewH} = calcViewBounds(width, height);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Subtle studio environment reflection for soft fabric depth without glossy glare
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Moody low-key showroom lighting for rich dark cherry-red drapery
    const hemiLight = new THREE.HemisphereLight(0xe8d5d8, 0x240208, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffeae4, 0.88);
    keyLight.position.set(-2.5, 5.5, 11.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd98092, 0.26);
    rimLight.position.set(6.5, 1.5, 8.5);
    scene.add(rimLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const weaveBump = createPolyesterWeaveBumpTexture(maxAniso);

    const textureLoader = new THREE.TextureLoader();
    const colorMap = textureLoader.load(CURTAIN_TEXTURE_IMAGE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.needsUpdate = true;
    });
    colorMap.colorSpace = THREE.SRGBColorSpace;
    colorMap.anisotropy = maxAniso;

    // Neutral dark tint preserves pure cherry hue while deepening it into lush dark cherry red
    const clothMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x6e6668),
      map: colorMap,
      emissive: new THREE.Color(0x210107),
      emissiveMap: colorMap,
      emissiveIntensity: 0.2,
      bumpMap: weaveBump,
      bumpScale: 0.01,
      roughness: 0.84,
      metalness: 0.0,
      sheen: 0.28,
      sheenRoughness: 0.78,
      sheenColor: new THREE.Color(0x9e1832),
      clearcoat: 0,
      envMapIntensity: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
    });

    let panels: ClothPanel[] = [
      createClothPanel(-1, viewW, viewH, clothMaterial),
      createClothPanel(1, viewW, viewH, clothMaterial),
    ];
    panels.forEach((p) => scene.add(p.mesh));

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Track dimensions to ignore minor mobile address-bar height changes during scroll
    let lastMountedW = width;
    let lastMountedH = height;

    // Simulation constants tuned for lively, bouncy, jiggle-wiggle realistic polyester drapery
    const GRAVITY = -12.0;
    const DAMPING = 0.985; // Elastic silky rebound for authentic bouncy jiggle-wiggle!
    const CONSTRAINT_ITERS = isSoftwareGl ? 3 : 5;
    const FIXED_DT = 1 / 60;
    const DT_SQ = FIXED_DT * FIXED_DT;

    let frameId = 0;
    let disposed = false;
    let lastNow = performance.now();
    let elapsed = 0;

    const stepPhysics = (progress: number, time: number, impulses: CurtainImpulse[]) => {
      const p = THREE.MathUtils.clamp(progress, 0, 1);
      // Smooth S-curve for top track gathering & natural curved drapery parting
      const slide = p * p * (3 - 2 * p);
      const bow = Math.sin(p * Math.PI);

      // Gentle opacity fade only once the massive wide drapes have cleared the viewport
      clothMaterial.opacity = p > 0.92 ? THREE.MathUtils.clamp(1 - (p - 0.92) / 0.08, 0, 1) : 1;

      for (let pi = 0; pi < panels.length; pi++) {
        const panel = panels[pi];
        const {pos, prev, restX, restY, restZ, side, outerWallX} = panel;

        // 1. Pinned top track rings (row = 0): gather smoothly toward the far off-screen walls
        for (let c = 0; c <= COLS; c++) {
          const i3 = c * 3;
          const uNorm = c / COLS;
          const innerFactor = side === -1 ? uNorm : 1 - uNorm;

          // Compress pleats accordion-style toward outerWallX and slide past screen edge
          const gatherScale = 1 - slide * 0.78;
          const wallShift = side * slide * viewW * 0.24;
          const baseOffset = restX[c] - outerWallX;
          const targetTopX = outerWallX + baseOffset * gatherScale + wallShift;

          // Pleats deepen naturally in 3D Z as the polyester fabric bunches together
          const pleatDepth = 0.13 + slide * 0.28;
          const targetTopZ =
            Math.sin(innerFactor * Math.PI * 12 + side * slide * 1.1) * pleatDepth;

          pos[i3] = targetTopX;
          pos[i3 + 1] = restY[c];
          pos[i3 + 2] = targetTopZ;
          prev[i3] = targetTopX;
          prev[i3 + 1] = restY[c];
          prev[i3 + 2] = targetTopZ;
        }

        // 2. Verlet cloth integration: gravity, gentle showroom air, realistic curved draw, bouncy touch!
        for (let r = 1; r <= ROWS; r++) {
          const vNorm = r / ROWS;
          // Natural theatrical draw-curve peaks around mid-height, trailing gracefully toward the floor hem
          const waistCurve = Math.exp(-Math.pow((vNorm - 0.44) / 0.36, 2));

          for (let c = 0; c <= COLS; c++) {
            const idx = r * (COLS + 1) + c;
            const i3 = idx * 3;

            // Keep the far off-screen outer edge anchored along the wall rail so zero side gap ever opens!
            const isOuterEdge = (side === -1 && c === 0) || (side === 1 && c === COLS);
            if (isOuterEdge) {
              const anchorX = outerWallX + side * slide * viewW * 0.24;
              pos[i3] = anchorX;
              pos[i3 + 1] = restY[idx];
              pos[i3 + 2] = restZ[idx];
              prev[i3] = anchorX;
              prev[i3 + 1] = restY[idx];
              prev[i3 + 2] = restZ[idx];
              continue;
            }

            const x = pos[i3];
            const y = pos[i3 + 1];
            const z = pos[i3 + 2];

            let vx = (x - prev[i3]) * DAMPING;
            let vy = (y - prev[i3 + 1]) * DAMPING;
            let vz = (z - prev[i3 + 2]) * DAMPING;

            vx = THREE.MathUtils.clamp(vx, -0.32, 0.32);
            vy = THREE.MathUtils.clamp(vy, -0.32, 0.32);
            vz = THREE.MathUtils.clamp(vz, -0.44, 0.44);

            prev[i3] = x;
            prev[i3 + 1] = y;
            prev[i3 + 2] = z;

            // Subtle living showroom breeze keeping the tall polyester drapes organic
            const wavePhase = time * 1.6 + c * 0.34 + r * 0.2;
            const windX = Math.sin(wavePhase * 0.65) * 0.24 * vNorm;
            const windZ =
              (Math.sin(wavePhase) * 0.42 + Math.cos(time * 2.3 - r * 0.3 + c * 0.2) * 0.22) *
              (0.3 + vNorm * 0.7);

            // Real curved side-pull force as the drapes glide open past the black Fortuner
            const innerFactor = side === -1 ? c / COLS : 1 - c / COLS;
            const curveDrawX =
              side *
              (bow * waistCurve * (13.0 + innerFactor * 16.0) +
                slide * slide * (15.0 + innerFactor * 12.0 + vNorm * 5.0));
            const curveBillowZ = bow * waistCurve * innerFactor * 3.4;

            // Elastic spring memory toward natural vertical pleat Z-contour
            const pleatReturnZ = (restZ[idx] - z) * 4.4 * (1 - slide * 0.55);

            let ax = windX + curveDrawX;
            let ay = GRAVITY;
            let az = windZ + curveBillowZ + pleatReturnZ;

            // Bouncy jiggle-wiggle touch/poke/brush impulses!
            for (let k = 0; k < impulses.length; k++) {
              const imp = impulses[k];
              const wx = (imp.nx - 0.5) * viewW;
              const wy = (0.5 - imp.ny) * viewH;
              const dx = x - wx;
              const dy = y - wy;
              const distSq = dx * dx + dy * dy;
              const radius = viewH * 0.26;
              const radiusSq = radius * radius;

              if (distSq < radiusSq) {
                const falloff = Math.pow(1 - Math.sqrt(distSq) / radius, 1.4);
                ax += imp.vx * viewW * 74 * falloff;
                ay += -imp.vy * viewH * 46 * falloff;
                const speedMag = Math.min(Math.hypot(imp.vx, imp.vy), 0.14);
                const zPush = -(imp.poke * 52 + speedMag * 350) * falloff;
                az += zPush;
              }
            }

            pos[i3] = x + vx + ax * DT_SQ;
            pos[i3 + 1] = y + vy + ay * DT_SQ;
            pos[i3 + 2] = THREE.MathUtils.clamp(z + vz + az * DT_SQ, -1.65, 1.65);
          }
        }

        // 3. Structural + shear constraints maintain woven polyester cohesion & graceful gathering
        const {restDx, restDy, restDiag} = panel;
        // As the curtain gathers (slide > 0), relax horizontal rest length slightly so folds bunch smoothly
        const activeRestDx = restDx * (1 - slide * 0.42);
        const activeRestDiag = Math.hypot(activeRestDx, restDy);

        for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
          for (let r = 0; r <= ROWS; r++) {
            for (let c = 0; c <= COLS; c++) {
              const idx = r * (COLS + 1) + c;
              const pinA =
                r === 0 || (side === -1 && c === 0) || (side === 1 && c === COLS);

              if (c < COLS) {
                const pinB =
                  r === 0 || (side === -1 && c + 1 === 0) || (side === 1 && c + 1 === COLS);
                solveDistanceConstraint(pos, idx, idx + 1, activeRestDx, pinA, pinB, 0.7);
              }
              if (r < ROWS) {
                const pinB =
                  (side === -1 && c === 0) || (side === 1 && c === COLS);
                solveDistanceConstraint(
                  pos,
                  idx,
                  idx + (COLS + 1),
                  restDy,
                  pinA,
                  pinB,
                  0.92
                );
              }
              if (c < COLS && r < ROWS) {
                const pinB =
                  (side === -1 && c + 1 === 0) || (side === 1 && c + 1 === COLS);
                solveDistanceConstraint(
                  pos,
                  idx,
                  idx + (COLS + 1) + 1,
                  activeRestDiag,
                  pinA,
                  pinB,
                  0.42
                );
              }
            }
          }
        }

        const posAttr = panel.geometry.attributes.position as THREE.BufferAttribute;
        (posAttr.array as Float32Array).set(pos);
        posAttr.needsUpdate = true;
        panel.geometry.computeVertexNormals();
      }
    };

    const rebuildPanels = () => {
      const nextW = Math.max(1, mount.clientWidth || window.innerWidth);
      const nextH = Math.max(1, mount.clientHeight || window.innerHeight);
      if (Math.abs(nextW - lastMountedW) < 2 && Math.abs(nextH - lastMountedH) < 120) {
        return;
      }
      lastMountedW = nextW;
      lastMountedH = nextH;

      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
      const bounds = calcViewBounds(nextW, nextH);
      viewW = bounds.viewW;
      viewH = bounds.viewH;

      panels.forEach((panel) => {
        scene.remove(panel.mesh);
        panel.geometry.dispose();
      });
      panels = [
        createClothPanel(-1, viewW, viewH, clothMaterial),
        createClothPanel(1, viewW, viewH, clothMaterial),
      ];
      panels.forEach((p) => scene.add(p.mesh));
      if (progressRef.current > 0.01) {
        stepPhysics(progressRef.current, elapsed, []);
      }
    };

    const onResize = () => rebuildPanels();
    window.addEventListener('resize', onResize);

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 70);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const scheduleNext = () => {
      if (disposed) return;
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;
      elapsed += dt;

      const impulses =
        impulseQueueRef.current.length > 0 ? impulseQueueRef.current.splice(0) : [];

      if (activeRef.current || progressRef.current < 0.995) {
        stepPhysics(progressRef.current, elapsed, impulses);
        renderer.render(scene, camera);
      }

      scheduleNext();
    };

    scheduleNext();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.removeEventListener('resize', onResize);

      panels.forEach((p) => {
        scene.remove(p.mesh);
        p.geometry.dispose();
      });
      clothMaterial.dispose();
      colorMap.dispose();
      weaveBump.dispose();
      envTarget.dispose();
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, [progressRef, impulseQueueRef]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
