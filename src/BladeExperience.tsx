import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Phase = "waiting" | "assembling" | "scene" | "finale" | "exploring";
type ParticleGroup = "body" | "sword";

type ExperienceScene = {
  organization: string;
  dates: string;
  role: string;
  focus: string;
  summary: string;
  result: string;
  resultLabel: string;
};

type Target = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  frx: number;
  fry: number;
  group: ParticleGroup;
};

type Particle = Target & {
  sx: number;
  sy: number;
  px: number;
  py: number;
  cx: number;
  cy: number;
  delay: number;
  tile: number;
  size: number;
  seed: number;
  tone: number;
};

type FollowerPixel = {
  x: number;
  y: number;
  size: number;
  tone: number;
  seed: number;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

type DecisionNode3D = {
  x: number;
  y: number;
  z: number;
  parent: number;
  level: number;
  label: string;
  detail: string;
  state: "neutral" | "approved" | "declined";
};

type TreeControls = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
};

type Layout = {
  heroX: number;
  heroY: number;
  heroHeight: number;
  swordX: number;
  swordY: number;
  swordHeight: number;
  handX: number;
  handY: number;
};

const experienceScenes: ExperienceScene[] = [
  {
    organization: "Flex",
    dates: "Summer 2026",
    role: "Software Engineering Intern",
    focus: "Underwriting infrastructure · Financial risk tooling",
    summary: "Built inspectable decision traces across two production underwriting workflows and 41 calculation steps.",
    result: "30–60 min → under 5 min",
    resultLabel: "workflow walkthroughs",
  },
  {
    organization: "UCLA PSS Lab",
    dates: "2025 — Present",
    role: "Undergraduate Research Assistant",
    focus: "JVM / Serverless runtime performance",
    summary: "Persisted profiling and compilation artifacts across OpenFaaS cold starts with Redis-backed caching.",
    result: "337 → 125 ms",
    resultLabel: "first-request latency · 2.7× faster",
  },
  {
    organization: "US Chess",
    dates: "2023 — 2024",
    role: "Web Developer Intern",
    focus: "Chess Life archive · Data and editorial systems",
    summary: "Helped build SQL-backed search and retrieval for decades of Chess Life issues.",
    result: "250K+ monthly readers",
    resultLabel: "served by the publishing platform",
  },
  {
    organization: "UC Santa Barbara",
    dates: "2022 — 2025",
    role: "Research Assistant",
    focus: "Network systems · Adaptive bitrate experiments",
    summary: "Compared adaptive-bitrate behavior across controlled throughput and latency conditions.",
    result: "10K+ packet samples · 6+ variants",
    resultLabel: "work supporting SIGCOMM ’24 research",
  },
];

const fieldColors = ["#07090d", "#090d13", "#0c1118", "#101821"];
const cloakColors = ["#26313b", "#41505c", "#75858f", "#aab8bf"];
const bladeColors = ["#d9f5ff", "#8cddff", "#6b9cff", "#f1f7f8"];
const sceneBodyColors = [
  cloakColors,
  ["#172433", "#34526f", "#6b9cff", "#d9f5ff"],
  ["#262a31", "#4b5260", "#cabf9b", "#fff2b8"],
  ["#152a34", "#315d70", "#5eb7d5", "#d9f5ff"],
];

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 4);
const easeInOut = (value: number) => {
  const progress = clamp(value);
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
};

const decisionNodes: DecisionNode3D[] = [
  { x: -250, y: 0, z: 0, parent: -1, level: 0, label: "APPLICATION", detail: "Applicant inputs enter the underwriting workflow.", state: "approved" },
  { x: -125, y: -145, z: -70, parent: 0, level: 1, label: "REVENUE", detail: "Normalizes revenue signals and verifies reported scale.", state: "neutral" },
  { x: -118, y: 0, z: 85, parent: 0, level: 1, label: "FICO", detail: "Routes the application by credit-score threshold.", state: "approved" },
  { x: -125, y: 145, z: -30, parent: 0, level: 1, label: "CASH FLOW", detail: "Evaluates operating cash flow and repayment capacity.", state: "neutral" },
  { x: 12, y: -210, z: -135, parent: 1, level: 2, label: "STABILITY", detail: "Checks the consistency of revenue over time.", state: "neutral" },
  { x: 22, y: -92, z: 12, parent: 1, level: 2, label: "REVIEW", detail: "Flags ambiguous revenue evidence for manual review.", state: "neutral" },
  { x: 20, y: -24, z: 150, parent: 2, level: 2, label: "680+", detail: "Qualifying credit branch continues through risk grading.", state: "approved" },
  { x: 18, y: 72, z: 42, parent: 2, level: 2, label: "< 680", detail: "Below-threshold applications move toward decline logic.", state: "declined" },
  { x: 8, y: 156, z: -105, parent: 3, level: 2, label: "COVERAGE", detail: "Measures available cash against projected obligations.", state: "neutral" },
  { x: 22, y: 235, z: 44, parent: 3, level: 2, label: "VOLATILITY", detail: "Detects unstable cash-flow patterns and outliers.", state: "neutral" },
  { x: 168, y: -178, z: -70, parent: 4, level: 3, label: "TIER 1", detail: "Stable revenue produces the strongest operating tier.", state: "neutral" },
  { x: 172, y: -48, z: 118, parent: 6, level: 3, label: "RISK TIER", detail: "Combines qualifying signals into an explainable risk grade.", state: "approved" },
  { x: 176, y: 80, z: 68, parent: 7, level: 3, label: "DECLINE", detail: "Records the failed threshold and decline explanation.", state: "declined" },
  { x: 170, y: 174, z: -78, parent: 8, level: 3, label: "TIER 3", detail: "Lower coverage creates a more conservative tier.", state: "neutral" },
  { x: 172, y: 250, z: 18, parent: 9, level: 3, label: "MANUAL", detail: "High volatility sends the case to an operator.", state: "neutral" },
  { x: 330, y: -46, z: 78, parent: 11, level: 4, label: "APPROVED", detail: "The qualified path returns an approval decision.", state: "approved" },
  { x: 330, y: 62, z: -42, parent: 11, level: 4, label: "LIMIT", detail: "Final calculation assigns an explainable credit limit.", state: "approved" },
];

const approvedDecisionPath = new Set([0, 2, 6, 11, 15, 16]);

function seededRandom(seedValue: number) {
  let seed = seedValue >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function drawBladeMask(context: CanvasRenderingContext2D, centerX: number, centerY: number, height: number) {
  const top = centerY - height * 0.48;
  const guardY = centerY + height * 0.2;
  const bottom = centerY + height * 0.48;
  const width = height * 0.075;

  context.save();
  context.fillStyle = "#fff";
  context.beginPath();
  context.moveTo(centerX - width * 0.12, top);
  context.lineTo(centerX + width * 0.5, top + height * 0.075);
  context.lineTo(centerX + width * 0.78, top + height * 0.18);
  context.lineTo(centerX + width * 0.58, guardY - height * 0.035);
  context.lineTo(centerX + width * 0.12, guardY + height * 0.012);
  context.lineTo(centerX - width * 0.31, guardY - height * 0.012);
  context.lineTo(centerX - width * 0.69, top + height * 0.25);
  context.lineTo(centerX - width * 0.48, top + height * 0.105);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(centerX - height * 0.145, guardY - height * 0.012);
  context.lineTo(centerX - width * 0.24, guardY - height * 0.034);
  context.lineTo(centerX, guardY + height * 0.005);
  context.lineTo(centerX + height * 0.17, guardY - height * 0.018);
  context.lineTo(centerX + height * 0.13, guardY + height * 0.035);
  context.lineTo(centerX + width * 0.22, guardY + height * 0.052);
  context.lineTo(centerX - height * 0.112, guardY + height * 0.038);
  context.closePath();
  context.fill();

  context.fillRect(centerX - width * 0.18, guardY + height * 0.035, width * 0.34, height * 0.33);
  context.beginPath();
  context.moveTo(centerX, bottom - height * 0.075);
  context.lineTo(centerX + width * 0.42, bottom - height * 0.025);
  context.lineTo(centerX + width * 0.12, bottom + height * 0.018);
  context.lineTo(centerX - width * 0.38, bottom - height * 0.002);
  context.lineTo(centerX - width * 0.32, bottom - height * 0.052);
  context.closePath();
  context.fill();

  context.globalCompositeOperation = "destination-out";
  const fracture = (y: number, direction: number, thickness: number) => {
    context.beginPath();
    context.moveTo(centerX - width, y - thickness);
    context.lineTo(centerX + width, y + direction * height * 0.035 - thickness);
    context.lineTo(centerX + width, y + direction * height * 0.035 + thickness);
    context.lineTo(centerX - width, y + thickness);
    context.closePath();
    context.fill();
  };
  fracture(top + height * 0.21, -1, Math.max(1.2, height * 0.003));
  fracture(top + height * 0.39, 1, Math.max(1.2, height * 0.0035));
  fracture(top + height * 0.54, -1, Math.max(1.2, height * 0.003));
  context.fillRect(centerX - height * 0.005, top + height * 0.09, height * 0.01, height * 0.49);
  context.restore();
}

function drawCloakMask(context: CanvasRenderingContext2D, centerX: number, centerY: number, height: number) {
  const top = centerY - height * 0.46;
  const shoulderY = centerY - height * 0.2;
  const bottom = centerY + height * 0.48;

  context.save();
  context.fillStyle = "#fff";

  context.beginPath();
  context.ellipse(centerX, top + height * 0.13, height * 0.115, height * 0.145, 0, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.moveTo(centerX - height * 0.1, top + height * 0.19);
  context.quadraticCurveTo(centerX - height * 0.25, shoulderY, centerX - height * 0.34, shoulderY + height * 0.13);
  context.lineTo(centerX - height * 0.27, bottom - height * 0.03);
  context.lineTo(centerX - height * 0.14, bottom - height * 0.09);
  context.lineTo(centerX - height * 0.035, bottom);
  context.lineTo(centerX + height * 0.065, bottom - height * 0.075);
  context.lineTo(centerX + height * 0.21, bottom - height * 0.015);
  context.lineTo(centerX + height * 0.29, shoulderY + height * 0.14);
  context.quadraticCurveTo(centerX + height * 0.23, shoulderY, centerX + height * 0.09, top + height * 0.19);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(centerX + height * 0.12, shoulderY + height * 0.02);
  context.lineTo(centerX + height * 0.25, centerY - height * 0.02);
  context.lineTo(centerX + height * 0.2, centerY + height * 0.045);
  context.lineTo(centerX + height * 0.05, centerY - height * 0.075);
  context.closePath();
  context.fill();

  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  context.ellipse(centerX, top + height * 0.135, height * 0.064, height * 0.084, 0, 0, Math.PI * 2);
  context.fill();

  context.lineWidth = Math.max(2, height * 0.006);
  context.strokeStyle = "#fff";
  [-0.12, 0.02, 0.14].forEach((offset, index) => {
    context.beginPath();
    context.moveTo(centerX + height * offset, centerY - height * 0.04);
    context.quadraticCurveTo(
      centerX + height * (offset + (index - 1) * 0.03),
      centerY + height * 0.2,
      centerX + height * (offset + (index - 1) * 0.05),
      bottom - height * 0.04,
    );
    context.stroke();
  });
  context.restore();
}

export default function BladeExperience({ onReady }: { onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const advanceRef = useRef<(x: number, y: number, skip?: boolean) => void>(() => undefined);
  const treeControlsRef = useRef<TreeControls>({
    zoomIn: () => undefined,
    zoomOut: () => undefined,
    reset: () => undefined,
  });
  const onReadyRef = useRef(onReady);
  const didReadyRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (phase !== "scene") return;
    const focusFrame = requestAnimationFrame(() => cardRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(focusFrame);
  }, [phase, sceneIndex]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const deepLinkId = ["experience", "research", "awards", "contact"]
      .find((id) => window.location.hash.toLowerCase() === `#${id}`);
    const deepLink = Boolean(deepLinkId);
    let width = Math.max(1, window.innerWidth);
    let height = Math.max(1, window.innerHeight);
    let currentPhase: Phase = "waiting";
    let currentScene = 0;
    let phaseStart = performance.now();
    let lastAdvance = 0;
    let frame = 0;
    let resizeFrame = 0;
    let lastFrame = 0;
    let particles: Particle[] = [];
    let sceneParticles: Particle[] = [];
    let followerPixels: FollowerPixel[] = [];
    let sparks: Spark[] = [];
    let scrollProgress = 0;
    let lastScroll = 0;
    let isHot = false;
    let layout: Layout;

    const pointer = {
      x: width / 2,
      y: height / 2,
      angle: -Math.PI / 2,
      speed: 0,
      lastMove: 0,
      active: false,
    };

    const blade = {
      x: width - 46,
      y: height * 0.2,
      vx: 0,
      vy: 0,
      angle: 0,
      angleVelocity: 0,
      scale: coarsePointer ? 86 : 112,
    };

    const treeCamera = {
      zoom: coarsePointer ? 0.82 : 1.18,
      panX: coarsePointer ? 0 : -width * 0.035,
      panY: coarsePointer ? -height * 0.05 : 0,
      dragging: false,
      moved: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
    };
    const resetTreeCamera = () => {
      treeCamera.zoom = coarsePointer ? 0.82 : 1.18;
      treeCamera.panX = coarsePointer ? 0 : -width * 0.035;
      treeCamera.panY = coarsePointer ? -height * 0.05 : 0;
    };

    treeControlsRef.current = {
      zoomIn: () => { treeCamera.zoom = Math.min(2.8, treeCamera.zoom * 1.2); },
      zoomOut: () => { treeCamera.zoom = Math.max(0.62, treeCamera.zoom / 1.2); },
      reset: resetTreeCamera,
    };

    const getLayout = (): Layout => {
      const heroHeight = coarsePointer
        ? Math.min(height * 0.42, width * 0.96, 460)
        : Math.min(height * 0.75, width * 0.5, 720);
      const heroX = coarsePointer ? width * 0.5 : width * 0.3;
      const heroY = coarsePointer ? height * 0.31 : height * 0.54;
      const swordHeight = heroHeight * 0.72;
      const handX = heroX + heroHeight * 0.205;
      const handY = heroY - heroHeight * 0.015;
      return {
        heroX,
        heroY,
        heroHeight,
        handX,
        handY,
        swordX: handX,
        swordY: handY - swordHeight * 0.2,
        swordHeight,
      };
    };

    document.documentElement.classList.add("blade-locked");
    document.body.classList.add("blade-locked");
    window.scrollTo({ top: 0, left: 0 });

    const resizeCanvas = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      layout = getLayout();
      const dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.15 : 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const buildFallbackFollower = () => {
      const random = seededRandom(0x523f0110);
      const next: FollowerPixel[] = [];
      const add = (x: number, y: number) => next.push({
        x,
        y,
        size: 1 + random() * 1.2,
        tone: Math.floor(random() * bladeColors.length),
        seed: random(),
      });

      for (let y = -0.47; y <= 0.2; y += 0.017) {
        const tip = clamp((y + 0.47) / 0.08);
        const halfWidth = (0.008 + tip * 0.027) * (y > 0.04 ? 0.8 : 1);
        for (let x = -halfWidth; x <= halfWidth; x += 0.013) add(x, y);
      }
      for (let x = -0.145; x <= 0.17; x += 0.014) {
        add(x, 0.205 + Math.abs(x) * 0.06);
        if (Math.abs(x) < 0.11) add(x, 0.222 + Math.abs(x) * 0.04);
      }
      for (let y = 0.23; y <= 0.46; y += 0.016) {
        add(-0.011, y);
        add(0.011, y);
      }
      [-0.025, 0, 0.025].forEach((x) => add(x, 0.47 + Math.abs(x) * 0.25));
      followerPixels = next;
    };

    const buildField = () => {
      const targetCount = coarsePointer ? 15000 : 39000;
      const tile = Math.max(coarsePointer ? 5 : 6, Math.ceil(Math.sqrt((width * height) / targetCount)));
      const random = seededRandom(0x523c10a);

      const bodyMask = document.createElement("canvas");
      const swordMask = document.createElement("canvas");
      bodyMask.width = swordMask.width = Math.ceil(width);
      bodyMask.height = swordMask.height = Math.ceil(height);
      const bodyContext = bodyMask.getContext("2d", { willReadFrequently: true });
      const swordContext = swordMask.getContext("2d", { willReadFrequently: true });
      if (!bodyContext || !swordContext) return;
      drawCloakMask(bodyContext, layout.heroX, layout.heroY, layout.heroHeight);
      drawBladeMask(swordContext, layout.swordX, layout.swordY, layout.swordHeight);
      const bodyData = bodyContext.getImageData(0, 0, bodyMask.width, bodyMask.height).data;
      const swordData = swordContext.getImageData(0, 0, swordMask.width, swordMask.height).data;
      const sampleStep = coarsePointer ? 4 : 3;
      const targets: Target[] = [];
      const swordTargets: Target[] = [];

      const collect = (
        data: Uint8ClampedArray,
        group: ParticleGroup,
        minimumX: number,
        maximumX: number,
        minimumY: number,
        maximumY: number,
      ) => {
        for (let y = Math.max(0, Math.floor(minimumY)); y < Math.min(height, maximumY); y += sampleStep) {
          for (let x = Math.max(0, Math.floor(minimumX)); x < Math.min(width, maximumX); x += sampleStep) {
            const alpha = data[(Math.floor(y) * bodyMask.width + Math.floor(x)) * 4 + 3];
            if (alpha > 100 && random() > 0.1) {
              const target: Target = {
                x,
                y,
                rx: (x - layout.heroX) / layout.heroHeight,
                ry: (y - layout.heroY) / layout.heroHeight,
                frx: group === "sword" ? (x - layout.swordX) / layout.swordHeight : 0,
                fry: group === "sword" ? (y - layout.swordY) / layout.swordHeight : 0,
                group,
              };
              targets.push(target);
              if (group === "sword") swordTargets.push(target);
            }
          }
        }
      };

      collect(
        bodyData,
        "body",
        layout.heroX - layout.heroHeight * 0.4,
        layout.heroX + layout.heroHeight * 0.36,
        layout.heroY - layout.heroHeight * 0.5,
        layout.heroY + layout.heroHeight * 0.52,
      );
      collect(
        swordData,
        "sword",
        layout.swordX - layout.swordHeight * 0.19,
        layout.swordX + layout.swordHeight * 0.2,
        layout.swordY - layout.swordHeight * 0.52,
        layout.swordY + layout.swordHeight * 0.53,
      );

      for (let index = targets.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [targets[index], targets[swapIndex]] = [targets[swapIndex], targets[index]];
      }

      const next: Particle[] = [];
      let index = 0;
      for (let y = 0; y < height; y += tile) {
        for (let x = 0; x < width; x += tile) {
          const target = targets[index % Math.max(1, targets.length)] ?? {
            x: layout.heroX,
            y: layout.heroY,
            rx: 0,
            ry: 0,
            frx: 0,
            fry: 0,
            group: "body" as ParticleGroup,
          };
          next.push({
            ...target,
            sx: x + tile / 2,
            sy: y + tile / 2,
            px: x + tile / 2,
            py: y + tile / 2,
            cx: 0,
            cy: 0,
            delay: 0,
            tile: tile + 0.7,
            size: 1 + random() * 1.25,
            seed: random(),
            tone: Math.floor(random() * 4),
          });
          index += 1;
        }
      }
      particles = next;
      const sceneStride = Math.max(1, Math.ceil(particles.length / (coarsePointer ? 4200 : 6800)));
      sceneParticles = particles.filter((_, particleIndex) => particleIndex % sceneStride === 0);
      const followerStride = Math.max(1, Math.ceil(swordTargets.length / (coarsePointer ? 430 : 760)));
      followerPixels = swordTargets
        .filter((_, targetIndex) => targetIndex % followerStride === 0)
        .map((target) => ({
          x: target.frx,
          y: target.fry,
          size: 1 + random() * 1.2,
          tone: Math.floor(random() * bladeColors.length),
          seed: random(),
        }));
      if (followerPixels.length === 0) buildFallbackFollower();
    };

    const unlock = () => {
      document.documentElement.classList.remove("blade-locked");
      document.body.classList.remove("blade-locked");
      if (!didReadyRef.current) {
        didReadyRef.current = true;
        onReadyRef.current();
      }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const target = deepLinkId ? document.getElementById(deepLinkId) : null;
        target?.scrollIntoView();
        const focusTarget = (target ?? document.querySelector(".hero-name")) as HTMLElement | null;
        focusTarget?.focus({ preventScroll: true });
      }));
    };

    const startExploring = (instant = false) => {
      if (currentPhase === "exploring") return;
      currentPhase = "exploring";
      phaseStart = performance.now();
      setPhase("exploring");
      if (instant) {
        blade.x = width - (coarsePointer ? 26 : 43);
        blade.y = 82;
        blade.scale = coarsePointer ? 82 : 108;
      } else {
        blade.x = layout.swordX;
        blade.y = layout.swordY;
        blade.scale = layout.swordHeight;
      }
      unlock();
    };

    const prepareAssembly = (originX: number, originY: number) => {
      const random = seededRandom(0x523b1ade);
      const maximumDistance = Math.hypot(width, height);
      particles.forEach((particle) => {
        const dx = particle.x - particle.sx;
        const dy = particle.y - particle.sy;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const bend = (random() - 0.5) * Math.min(300, distance * 0.58);
        particle.cx = (particle.sx + particle.x) / 2 - (dy / distance) * bend;
        particle.cy = (particle.sy + particle.y) / 2 + (dx / distance) * bend;
        particle.delay = (Math.hypot(particle.sx - originX, particle.sy - originY) / maximumDistance) * 230 + random() * 150;
      });
    };

    advanceRef.current = (clickX: number, clickY: number, skip = false) => {
      if (skip || reducedMotion) {
        startExploring(true);
        return;
      }
      const now = performance.now();
      if (currentPhase === "waiting") {
        prepareAssembly(clickX || width / 2, clickY || height / 2);
        currentPhase = "assembling";
        phaseStart = now;
        setPhase("assembling");
        return;
      }
      const sceneLock = [1680, 1520, 1580, 1620][currentScene] ?? 960;
      if (currentPhase !== "scene" || now - phaseStart < sceneLock || now - lastAdvance < sceneLock) return;
      lastAdvance = now;
      if (currentScene < experienceScenes.length - 1) {
        currentScene += 1;
        phaseStart = now;
        setSceneIndex(currentScene);
      } else {
        currentPhase = "finale";
        phaseStart = now;
        setPhase("finale");
      }
    };

    const addSpark = (x: number, y: number, vx: number, vy: number) => {
      sparks.push({ x, y, vx, vy, life: 1, size: 0.8 + Math.random() * 1.6 });
      if (sparks.length > 90) sparks = sparks.slice(-90);
    };

    const isTreeStage = (target: EventTarget | null) =>
      currentPhase === "scene"
      && currentScene === 0
      && target instanceof Element
      && Boolean(target.closest(".chronicle-tree-stage"));

    const onPointerDown = (event: PointerEvent) => {
      if (!isTreeStage(event.target)) return;
      treeCamera.dragging = true;
      treeCamera.moved = false;
      treeCamera.startX = treeCamera.lastX = event.clientX;
      treeCamera.startY = treeCamera.lastY = event.clientY;
      (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const distance = Math.hypot(dx, dy);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.speed = Math.min(45, distance);
      if (distance > 0.5) pointer.angle = Math.atan2(dy, dx);
      pointer.active = true;
      pointer.lastMove = performance.now();
      isHot = Boolean((event.target as Element | null)?.closest?.("[data-blade-target]"));
      if (treeCamera.dragging) {
        const treeDx = event.clientX - treeCamera.lastX;
        const treeDy = event.clientY - treeCamera.lastY;
        treeCamera.panX += treeDx;
        treeCamera.panY += treeDy;
        treeCamera.lastX = event.clientX;
        treeCamera.lastY = event.clientY;
        if (Math.hypot(event.clientX - treeCamera.startX, event.clientY - treeCamera.startY) > 4) {
          treeCamera.moved = true;
        }
      }
      if (currentPhase === "exploring" && distance > 6 && Math.random() > 0.45) {
        addSpark(blade.x, blade.y, -dx * 0.025 + (Math.random() - 0.5), -dy * 0.025 + (Math.random() - 0.5));
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!treeCamera.dragging) return;
      treeCamera.dragging = false;
    };

    const onWheel = (event: WheelEvent) => {
      if (!isTreeStage(event.target)) return;
      event.preventDefault();
      const previousZoom = treeCamera.zoom;
      const zoomFactor = Math.exp(-event.deltaY * 0.0012);
      treeCamera.zoom = Math.max(0.62, Math.min(2.8, treeCamera.zoom * zoomFactor));
      const zoomRatio = treeCamera.zoom / previousZoom;
      const baseX = coarsePointer ? width * 0.48 : width * 0.38;
      const baseY = coarsePointer ? height * 0.37 : height * 0.49;
      treeCamera.panX = event.clientX - baseX - (event.clientX - baseX - treeCamera.panX) * zoomRatio;
      treeCamera.panY = event.clientY - baseY - (event.clientY - baseY - treeCamera.panY) * zoomRatio;
    };

    const onScroll = () => {
      const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = clamp(window.scrollY / total);
      lastScroll = performance.now();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === "Escape" && currentPhase !== "exploring") {
        advanceRef.current(0, 0, true);
        return;
      }
      if ((event.key === "Enter" || event.key === " ") && currentPhase !== "exploring") {
        if (event.target instanceof HTMLButtonElement) return;
        event.preventDefault();
        advanceRef.current(width / 2, height / 2);
      }
    };

    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeCanvas();
        if (currentPhase !== "exploring") {
          buildField();
          if (currentPhase === "assembling") {
            prepareAssembly(width / 2, height / 2);
            phaseStart = performance.now();
          }
        } else if (reducedMotion) {
          context.clearRect(0, 0, width, height);
          drawExploring(performance.now());
        }
      });
    };

    const drawWaiting = (time: number) => {
      const pressureRadius = 118;
      for (const particle of particles) {
        let x = particle.sx;
        let y = particle.sy;
        if (pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < pressureRadius && distance > 0) {
            const force = Math.pow((pressureRadius - distance) / pressureRadius, 2);
            const displacement = force * (7 + pointer.speed * 0.28);
            x += (dx / distance) * displacement;
            y += (dy / distance) * displacement;
          }
        }
        const flicker = Math.sin(time * 0.001 + particle.seed * 18) > 0.94;
        context.fillStyle = flicker ? "#152432" : fieldColors[Math.floor(particle.seed * fieldColors.length)];
        context.fillRect(Math.floor(x - particle.tile / 2), Math.floor(y - particle.tile / 2), particle.tile + 0.6, particle.tile + 0.6);
      }
    };

    const drawAssembly = (time: number) => {
      context.fillStyle = "#07090d";
      context.fillRect(0, 0, width, height);
      const elapsed = time - phaseStart;
      const duration = 1150;
      for (const particle of particles) {
        const progress = clamp((elapsed - particle.delay) / duration);
        const eased = easeOut(progress);
        const inverse = 1 - eased;
        particle.px = inverse * inverse * particle.sx + 2 * inverse * eased * particle.cx + eased * eased * particle.x;
        particle.py = inverse * inverse * particle.sy + 2 * inverse * eased * particle.cy + eased * eased * particle.y;
        const size = particle.tile * (1 - eased) + particle.size * eased;
        const palette = particle.group === "sword" ? bladeColors : cloakColors;
        context.fillStyle = progress < 0.68 ? fieldColors[Math.floor(particle.seed * fieldColors.length)] : palette[particle.tone];
        context.fillRect(particle.px - size / 2, particle.py - size / 2, size, size);
      }
      if (elapsed > 1550) {
        currentPhase = "scene";
        currentScene = 0;
        phaseStart = time;
        lastAdvance = time;
        setSceneIndex(0);
        setPhase("scene");
      }
    };

    const drawDecisionGraph = (time: number, progress: number) => {
      const reveal = easeInOut(progress);
      const originX = (coarsePointer ? width * 0.48 : width * 0.38) + treeCamera.panX;
      const originY = (coarsePointer ? height * 0.37 : height * 0.49) + treeCamera.panY;
      const viewportScale = Math.min(
        coarsePointer ? width / 560 : width / 900,
        coarsePointer ? height / 660 : height / 680,
        1.62,
      ) * treeCamera.zoom;
      const focalLength = (coarsePointer ? 430 : 680) * viewportScale;
      const cameraDepth = 760 - reveal * 105;
      const yaw = -0.48 + reveal * 0.12 + Math.sin(time * 0.00042) * 0.018;
      const pitch = -0.095 + Math.sin(time * 0.00031) * 0.012;
      const roll = -0.025 + reveal * 0.025;
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const cosRoll = Math.cos(roll);
      const sinRoll = Math.sin(roll);

      const project = (node: Pick<DecisionNode3D, "x" | "y" | "z">) => {
        const yawX = node.x * cosYaw - node.z * sinYaw;
        const yawZ = node.x * sinYaw + node.z * cosYaw;
        const pitchY = node.y * cosPitch - yawZ * sinPitch;
        const pitchZ = node.y * sinPitch + yawZ * cosPitch;
        const rollX = yawX * cosRoll - pitchY * sinRoll;
        const rollY = yawX * sinRoll + pitchY * cosRoll;
        const scale = focalLength / Math.max(180, cameraDepth + pitchZ);
        return {
          x: originX + rollX * scale,
          y: originY + rollY * scale,
          scale,
          depth: pitchZ,
        };
      };

      const projected = decisionNodes.map(project);
      const impact = clamp(1 - Math.abs(progress - 0.13) / 0.1);
      const treeAlpha = clamp((progress - 0.08) / 0.2);

      context.save();
      context.globalCompositeOperation = "lighter";

      if (impact > 0) {
        const impactX = originX - 205 * viewportScale;
        const impactY = originY;
        const flare = context.createRadialGradient(impactX, impactY, 0, impactX, impactY, 250 * viewportScale);
        flare.addColorStop(0, `rgba(244, 226, 155, ${impact * 0.44})`);
        flare.addColorStop(0.16, `rgba(140, 221, 255, ${impact * 0.2})`);
        flare.addColorStop(1, "rgba(7, 9, 13, 0)");
        context.fillStyle = flare;
        context.fillRect(impactX - 280, impactY - 280, 560, 560);
      }

      context.globalAlpha = treeAlpha * 0.22;
      context.strokeStyle = "#8cddff";
      context.lineWidth = 0.8;
      for (let depth = -220; depth <= 240; depth += 92) {
        const left = project({ x: -320, y: 288, z: depth });
        const right = project({ x: 380, y: 288, z: depth });
        context.beginPath();
        context.moveTo(left.x, left.y);
        context.lineTo(right.x, right.y);
        context.stroke();
      }
      for (let x = -320; x <= 380; x += 116) {
        const near = project({ x, y: 288, z: -220 });
        const far = project({ x, y: 288, z: 240 });
        context.beginPath();
        context.moveTo(near.x, near.y);
        context.lineTo(far.x, far.y);
        context.stroke();
      }

      decisionNodes.forEach((node, index) => {
        if (node.parent < 0) return;
        const parent = decisionNodes[node.parent];
        const from = projected[node.parent];
        const to = projected[index];
        const edgeStart = 0.13 + node.level * 0.105;
        const edgeProgress = easeOut(clamp((progress - edgeStart) / 0.3));
        if (edgeProgress <= 0) return;
        const bend = project({
          x: parent.x + (node.x - parent.x) * 0.52,
          y: parent.y + (node.y - parent.y) * 0.18,
          z: parent.z + (node.z - parent.z) * 0.62,
        });
        const endX = bend.x + (to.x - bend.x) * edgeProgress;
        const endY = bend.y + (to.y - bend.y) * edgeProgress;
        const approved = approvedDecisionPath.has(index) && approvedDecisionPath.has(node.parent);
        const declined = node.state === "declined";
        const color = approved ? "#eadb9c" : declined ? "#ff6f73" : "#77cce9";
        context.globalAlpha = treeAlpha * (approved ? 0.92 : declined ? 0.55 : 0.38);
        context.shadowColor = color;
        context.shadowBlur = approved ? 14 : 7;
        context.strokeStyle = color;
        context.lineWidth = approved ? Math.max(1.4, from.scale * 2.5) : Math.max(0.8, from.scale * 1.4);
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.bezierCurveTo(bend.x, from.y, bend.x, endY, endX, endY);
        context.stroke();
      });

      const drawHex = (x: number, y: number, radius: number, color: string, fillAlpha: number) => {
        context.beginPath();
        for (let side = 0; side < 6; side += 1) {
          const angle = Math.PI / 6 + side * Math.PI / 3;
          const pointX = x + Math.cos(angle) * radius;
          const pointY = y + Math.sin(angle) * radius;
          if (side === 0) context.moveTo(pointX, pointY);
          else context.lineTo(pointX, pointY);
        }
        context.closePath();
        context.fillStyle = color;
        context.globalAlpha = fillAlpha;
        context.fill();
        context.globalAlpha = Math.min(1, fillAlpha * 2.8);
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.stroke();
      };

      [...decisionNodes.keys()]
        .sort((a, b) => projected[b].depth - projected[a].depth)
        .forEach((index) => {
          const node = decisionNodes[index];
          const point = projected[index];
          const nodeStart = 0.1 + node.level * 0.11;
          const nodeProgress = easeOut(clamp((progress - nodeStart) / 0.22));
          if (nodeProgress <= 0) return;
          const approved = approvedDecisionPath.has(index);
          const color = node.state === "declined" ? "#ff6f73" : approved ? "#eadb9c" : "#8cddff";
          const radius = (approved ? 8.5 : 6.4) * point.scale * viewportScale * nodeProgress;
          context.shadowColor = color;
          context.shadowBlur = approved ? 22 : 11;
          drawHex(point.x + 4 * point.scale, point.y + 6 * point.scale, radius, "#030609", treeAlpha * 0.72);
          drawHex(point.x, point.y, radius, color, treeAlpha * (approved ? 0.3 : 0.17));

          if (nodeProgress > 0.62) {
            context.shadowBlur = 0;
            context.globalAlpha = treeAlpha * clamp((nodeProgress - 0.62) / 0.38) * 0.9;
            context.fillStyle = color;
            context.font = `600 ${Math.max(coarsePointer ? 7 : 9, (coarsePointer ? 8 : 11) * point.scale * viewportScale)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            context.letterSpacing = "0.08em";
            context.fillText(node.label, point.x + radius + 8, point.y + 3);
          }

        });

      const pulsePosition = (time * 0.00023) % 1;
      const path = [0, 2, 6, 11, 15, 16];
      const segmentFloat = pulsePosition * (path.length - 1);
      const segment = Math.min(path.length - 2, Math.floor(segmentFloat));
      const segmentProgress = segmentFloat - segment;
      const pulseFrom = projected[path[segment]];
      const pulseTo = projected[path[segment + 1]];
      const pulseX = pulseFrom.x + (pulseTo.x - pulseFrom.x) * segmentProgress;
      const pulseY = pulseFrom.y + (pulseTo.y - pulseFrom.y) * segmentProgress;
      const pulseRadius = 3 + Math.sin(time * 0.012) * 1.2;
      context.globalAlpha = treeAlpha * clamp((progress - 0.52) / 0.2);
      context.fillStyle = "#fff6cc";
      context.shadowColor = "#eadb9c";
      context.shadowBlur = 24;
      context.beginPath();
      context.arc(pulseX, pulseY, pulseRadius, 0, Math.PI * 2);
      context.fill();

      if (!coarsePointer) {
        context.shadowBlur = 0;
        context.globalAlpha = treeAlpha * clamp((progress - 0.58) / 0.2) * 0.5;
        context.fillStyle = "#d9f5ff";
        context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.letterSpacing = "0.12em";
        context.fillText("2 WORKFLOWS / 41 CALCULATION STEPS", originX - 185, originY + 285 * viewportScale);
      }
      context.restore();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const drawColdPulse = (time: number, progress: number, alpha: number) => {
      const fracture = easeOut(clamp(progress / 0.3));
      const cacheHit = easeInOut(clamp((progress - 0.28) / 0.52));
      const x = coarsePointer ? width * 0.5 : layout.handX + layout.heroHeight * 0.18;
      const y = coarsePointer
        ? layout.heroY + layout.heroHeight * 0.21
        : layout.heroY + layout.heroHeight * 0.39;
      const chestX = layout.heroX + layout.heroHeight * 0.02;
      const chestY = layout.heroY - layout.heroHeight * 0.12;
      const random = seededRandom(0x523ca5e);

      context.save();
      context.globalCompositeOperation = "lighter";

      const frost = context.createRadialGradient(chestX, chestY, 0, chestX, chestY, layout.heroHeight * 0.52);
      frost.addColorStop(0, `rgba(107, 156, 255, ${(1 - cacheHit) * fracture * 0.16})`);
      frost.addColorStop(0.52, `rgba(140, 221, 255, ${(1 - cacheHit) * fracture * 0.07})`);
      frost.addColorStop(1, "rgba(7, 9, 13, 0)");
      context.fillStyle = frost;
      context.fillRect(chestX - layout.heroHeight * 0.55, chestY - layout.heroHeight * 0.55, layout.heroHeight * 1.1, layout.heroHeight * 1.1);

      for (let index = 0; index < (coarsePointer ? 24 : 54); index += 1) {
        const angle = random() * Math.PI * 2;
        const distance = layout.heroHeight * (0.12 + random() * 0.42);
        const scatter = Math.sin(clamp(progress / 0.56) * Math.PI);
        const startX = chestX + Math.cos(angle) * distance * scatter;
        const startY = chestY + Math.sin(angle) * distance * scatter;
        const returnProgress = easeInOut(clamp((cacheHit - random() * 0.3) / 0.7));
        const shardX = startX + (x - startX) * returnProgress;
        const shardY = startY + (y - startY) * returnProgress;
        const length = 4 + random() * 13;
        context.globalAlpha = alpha * (0.18 + random() * 0.44) * clamp(fracture + cacheHit);
        context.strokeStyle = index % 4 === 0 ? "#d9f5ff" : index % 2 ? "#6b9cff" : "#8cddff";
        context.lineWidth = 0.7 + random();
        context.beginPath();
        context.moveTo(shardX - Math.cos(angle) * length, shardY - Math.sin(angle) * length);
        context.lineTo(shardX + Math.cos(angle) * length, shardY + Math.sin(angle) * length);
        context.stroke();
      }

      context.shadowColor = "#8cddff";
      context.shadowBlur = 24;
      [0, 0.19, 0.38].forEach((offset, ringIndex) => {
        const ringProgress = (cacheHit + offset + time * 0.000055) % 1;
        const radius = (0.12 + ringProgress * 0.48) * layout.heroHeight;
        context.globalAlpha = alpha * (1 - ringProgress) * 0.46;
        context.strokeStyle = ringIndex === 1 ? "#6b9cff" : "#8cddff";
        context.lineWidth = ringIndex === 0 ? 1.8 : 1;
        context.beginPath();
        context.ellipse(x, y, radius, radius * 0.19, -0.08, 0, Math.PI * 2);
        context.stroke();
      });

      const coreRadius = (9 + cacheHit * 10) * (coarsePointer ? 0.75 : 1);
      context.globalAlpha = alpha * clamp(progress / 0.25);
      context.fillStyle = "#06101a";
      context.strokeStyle = "#d9f5ff";
      context.lineWidth = 1.4;
      context.beginPath();
      context.arc(x, y, coreRadius, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = "#8cddff";
      context.font = `${Math.max(8, coreRadius * 0.7)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("R", x, y + 0.5);

      if (cacheHit > 0.08) {
        const beam = context.createLinearGradient(x, y, chestX, chestY);
        beam.addColorStop(0, "rgba(217, 245, 255, .92)");
        beam.addColorStop(0.45, "rgba(107, 156, 255, .5)");
        beam.addColorStop(1, "rgba(140, 221, 255, 0)");
        context.globalAlpha = alpha * cacheHit * 0.72;
        context.strokeStyle = beam;
        context.lineWidth = 1.2 + cacheHit * 2;
        context.beginPath();
        context.moveTo(x, y);
        context.quadraticCurveTo(x - layout.heroHeight * 0.08, chestY + layout.heroHeight * 0.26, chestX, chestY);
        context.stroke();
      }

      if (!coarsePointer) {
        const textX = width * 0.51;
        const textY = height * 0.19;
        context.shadowBlur = 0;
        context.textAlign = "left";
        context.textBaseline = "alphabetic";
        context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.letterSpacing = "0.14em";
        context.globalAlpha = alpha * (1 - cacheHit) * fracture * 0.58;
        context.fillStyle = "#8cddff";
        context.fillText("COLD START", textX, textY);
        context.font = "600 42px ui-sans-serif, system-ui, sans-serif";
        context.letterSpacing = "-0.04em";
        context.fillStyle = "#d9f5ff";
        context.fillText("337 ms", textX, textY + 47);
        context.globalAlpha = alpha * cacheHit * 0.82;
        context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.letterSpacing = "0.14em";
        context.fillStyle = "#6b9cff";
        context.fillText("CACHE HIT", textX, textY);
        context.font = "600 46px ui-sans-serif, system-ui, sans-serif";
        context.letterSpacing = "-0.04em";
        context.fillStyle = "#eefcff";
        context.fillText("125 ms", textX, textY + 50);
      }
      context.restore();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      context.textAlign = "left";
      context.textBaseline = "alphabetic";
    };

    const drawChessArchive = (time: number, progress: number, alpha: number) => {
      const pageFlight = easeOut(clamp(progress / 0.58));
      const boardReveal = easeInOut(clamp((progress - 0.22) / 0.55));
      const tile = Math.max(20, Math.min(coarsePointer ? 30 : 46, width / 27));
      const centerX = coarsePointer ? width * 0.49 : width * 0.67;
      const centerY = coarsePointer ? height * 0.31 : height * 0.48;
      const random = seededRandom(0xc4e55a9);
      const boardPoint = (column: number, row: number) => {
        const worldX = (column - 4) * tile;
        const worldZ = (row - 4) * tile;
        const depthScale = 1 - row * 0.017;
        return {
          x: centerX + worldX * depthScale + worldZ * 0.34,
          y: centerY + worldZ * 0.42 - worldX * 0.08,
        };
      };

      context.save();
      context.globalCompositeOperation = "lighter";
      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, tile * 7.5);
      glow.addColorStop(0, `rgba(202, 191, 155, ${boardReveal * 0.12})`);
      glow.addColorStop(0.55, `rgba(140, 221, 255, ${boardReveal * 0.055})`);
      glow.addColorStop(1, "rgba(7, 9, 13, 0)");
      context.fillStyle = glow;
      context.fillRect(centerX - tile * 8, centerY - tile * 5, tile * 16, tile * 10);

      for (let index = 0; index < (coarsePointer ? 18 : 32); index += 1) {
        const column = index % 8;
        const row = Math.floor(index / 8) * 2 + (index % 2);
        const target = boardPoint(column + 0.5, row + 0.5);
        const startX = width * (-0.08 + random() * 0.45);
        const startY = height * (-0.1 + random() * 0.92);
        const delay = random() * 0.38;
        const localProgress = easeOut(clamp((pageFlight - delay) / (1 - delay)));
        const arc = Math.sin(localProgress * Math.PI) * (45 + random() * 130);
        const x = startX + (target.x - startX) * localProgress;
        const y = startY + (target.y - startY) * localProgress - arc;
        const pageWidth = (10 + random() * 10) * (1 - localProgress * 0.35);
        const pageHeight = pageWidth * 1.35;
        context.save();
        context.translate(x, y);
        context.rotate((1 - localProgress) * (random() - 0.5) * 4 + Math.sin(time * 0.002 + index) * 0.05);
        context.globalAlpha = alpha * clamp(localProgress / 0.25) * (1 - boardReveal * 0.55) * 0.48;
        context.fillStyle = index % 3 ? "#d9f5ff" : "#cabf9b";
        context.fillRect(-pageWidth / 2, -pageHeight / 2, pageWidth, pageHeight);
        context.globalAlpha *= 0.55;
        context.fillStyle = "#071018";
        context.fillRect(-pageWidth * 0.3, -pageHeight * 0.2, pageWidth * 0.6, 1);
        context.fillRect(-pageWidth * 0.3, 0, pageWidth * 0.45, 1);
        context.restore();
      }

      context.shadowColor = "#8cddff";
      context.shadowBlur = 10;
      for (let row = 0; row < 8; row += 1) {
        for (let column = 0; column < 8; column += 1) {
          const tileProgress = easeOut(clamp((boardReveal - (row * 8 + column) * 0.006) / 0.62));
          if (tileProgress <= 0) continue;
          const a = boardPoint(column, row);
          const b = boardPoint(column + 1, row);
          const c = boardPoint(column + 1, row + 1);
          const d = boardPoint(column, row + 1);
          context.globalAlpha = alpha * tileProgress * ((row + column) % 2 ? 0.16 : 0.36);
          context.fillStyle = (row + column) % 2 ? "#5b8093" : "#d8c98f";
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.lineTo(c.x, c.y);
          context.lineTo(d.x, d.y);
          context.closePath();
          context.fill();
        }
      }

      const knightSquare = boardPoint(3.35, 5.2);
      const knightScale = clamp((boardReveal - 0.42) / 0.34);
      context.globalAlpha = alpha * knightScale * 0.9;
      context.shadowColor = "#eadb9c";
      context.shadowBlur = 30;
      context.fillStyle = "#fff2b8";
      context.font = `${tile * 2.3}px Georgia, serif`;
      context.fillText("♞", knightSquare.x, knightSquare.y);

      const scan = (time * 0.00018) % 1;
      const scanStart = boardPoint(0, scan * 8);
      const scanEnd = boardPoint(8, scan * 8);
      context.globalAlpha = alpha * boardReveal * 0.42;
      context.strokeStyle = "#d9f5ff";
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(scanStart.x, scanStart.y);
      context.lineTo(scanEnd.x, scanEnd.y);
      context.stroke();

      if (!coarsePointer) {
        context.shadowBlur = 0;
        context.globalAlpha = alpha * clamp((progress - 0.62) / 0.24) * 0.58;
        context.fillStyle = "#eadb9c";
        context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.letterSpacing = "0.12em";
        context.fillText("DECADES OF CHESS LIFE / SQL-BACKED RETRIEVAL", width * 0.49, height * 0.18);
      }
      context.restore();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const drawPacketLanes = (time: number, progress: number, alpha: number) => {
      const reveal = easeInOut(clamp(progress / 0.75));
      const centerX = coarsePointer ? width * 0.52 : width * 0.69;
      const centerY = coarsePointer ? height * 0.29 : height * 0.46;
      const radius = Math.min(coarsePointer ? width * 0.31 : width * 0.2, height * (coarsePointer ? 0.19 : 0.28));
      const rotation = time * 0.00032;
      const nodeCount = coarsePointer ? 16 : 26;
      const nodes = Array.from({ length: nodeCount }, (_, index) => {
        const latitude = Math.asin(-1 + (2 * (index + 0.5)) / nodeCount);
        const longitude = index * 2.399963229728653 + rotation;
        const x3 = Math.cos(latitude) * Math.cos(longitude);
        const y3 = Math.sin(latitude);
        const z3 = Math.cos(latitude) * Math.sin(longitude);
        const perspective = 0.76 + (z3 + 1) * 0.16;
        return {
          x: centerX + x3 * radius * perspective,
          y: centerY + y3 * radius,
          z: z3,
          perspective,
        };
      });

      context.save();
      context.globalCompositeOperation = "lighter";
      const sphereGlow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.45);
      sphereGlow.addColorStop(0, `rgba(61, 121, 158, ${reveal * 0.17})`);
      sphereGlow.addColorStop(0.5, `rgba(107, 156, 255, ${reveal * 0.08})`);
      sphereGlow.addColorStop(1, "rgba(7, 9, 13, 0)");
      context.fillStyle = sphereGlow;
      context.fillRect(centerX - radius * 1.5, centerY - radius * 1.5, radius * 3, radius * 3);

      [0, 0.18, 0.36].forEach((offset) => {
        const wave = (progress * 1.2 + offset) % 1;
        context.globalAlpha = alpha * (1 - wave) * 0.3;
        context.strokeStyle = "#8cddff";
        context.lineWidth = 1;
        context.beginPath();
        context.ellipse(centerX, centerY, radius * (0.35 + wave * 1.25), radius * (0.1 + wave * 0.35), -0.08, 0, Math.PI * 2);
        context.stroke();
      });

      for (let index = 0; index < nodeCount; index += 1) {
        const connections = [(index + 3) % nodeCount, (index + 8) % nodeCount];
        for (const targetIndex of connections) {
          if (targetIndex <= index) continue;
          const from = nodes[index];
          const to = nodes[targetIndex];
          const edgeReveal = easeOut(clamp((reveal - index / nodeCount * 0.22) / 0.62));
          context.globalAlpha = alpha * edgeReveal * (0.1 + Math.max(from.z, to.z) * 0.09 + 0.1);
          context.strokeStyle = targetIndex % 3 ? "#8cddff" : "#6b9cff";
          context.lineWidth = 0.65 + Math.max(from.z, to.z) * 0.35;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.quadraticCurveTo(centerX, centerY, to.x, to.y);
          context.stroke();

          const packet = (time * 0.00038 + index * 0.071 + targetIndex * 0.037) % 1;
          const inverse = 1 - packet;
          const packetX = inverse * inverse * from.x + 2 * inverse * packet * centerX + packet * packet * to.x;
          const packetY = inverse * inverse * from.y + 2 * inverse * packet * centerY + packet * packet * to.y;
          context.globalAlpha = alpha * reveal * 0.72;
          context.fillStyle = "#d9f5ff";
          context.fillRect(packetX - 1.6, packetY - 1.6, 3.2, 3.2);
        }
      }

      [...nodes]
        .sort((a, b) => a.z - b.z)
        .forEach((node, index) => {
          const nodeReveal = easeOut(clamp((reveal - index / nodeCount * 0.18) / 0.54));
          const size = (2.2 + node.perspective * 2.6) * nodeReveal;
          context.globalAlpha = alpha * nodeReveal * (0.38 + (node.z + 1) * 0.23);
          context.fillStyle = index % 5 === 0 ? "#eadb9c" : index % 2 ? "#8cddff" : "#d9f5ff";
          context.shadowColor = context.fillStyle;
          context.shadowBlur = node.z > 0 ? 16 : 6;
          context.fillRect(node.x - size / 2, node.y - size / 2, size, size);
        });

      const beamProgress = easeOut(clamp((progress - 0.12) / 0.42));
      const beamStartX = layout.handX;
      const beamStartY = layout.handY - layout.heroHeight * 0.22;
      const beamEndX = beamStartX + (centerX - beamStartX) * beamProgress;
      const beamEndY = beamStartY + (centerY - beamStartY) * beamProgress;
      const beamGradient = context.createLinearGradient(beamStartX, beamStartY, centerX, centerY);
      beamGradient.addColorStop(0, "rgba(217, 245, 255, .95)");
      beamGradient.addColorStop(0.35, "rgba(140, 221, 255, .66)");
      beamGradient.addColorStop(1, "rgba(107, 156, 255, .08)");
      context.globalAlpha = alpha * beamProgress * 0.7;
      context.strokeStyle = beamGradient;
      context.lineWidth = 2.4;
      context.shadowColor = "#8cddff";
      context.shadowBlur = 22;
      context.beginPath();
      context.moveTo(beamStartX, beamStartY);
      context.lineTo(beamEndX, beamEndY);
      context.stroke();

      if (!coarsePointer) {
        context.shadowBlur = 0;
        context.globalAlpha = alpha * clamp((progress - 0.58) / 0.25) * 0.54;
        context.fillStyle = "#8cddff";
        context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.letterSpacing = "0.12em";
        context.fillText("10K+ PACKET SAMPLES / 6+ ABR VARIANTS", width * 0.5, height * 0.17);
      }
      context.restore();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const drawHero = (time: number, scene: number, action: number, finale = false, alphaMultiplier = 1) => {
      const active = action < 1 ? action : 1;
      const burst = action < 1 ? Math.sin(active * Math.PI) : 0;
      let bodyX = 0;
      let bodyY = Math.sin(time * 0.0018) * 1.5;
      let bodyAngle = 0;
      let swordAngle = 0;

      if (finale) {
        const charge = easeOut(clamp(active / 0.64));
        const strike = easeOut(clamp((active - 0.64) / 0.36));
        bodyX = -18 * charge + 54 * strike;
        bodyY += -5 * charge + 16 * strike;
        bodyAngle = -0.055 * charge + 0.1 * strike;
        swordAngle = 0.42 * charge - 1.92 * strike;
      } else if (scene === 0) {
        bodyX = burst * 9;
        bodyAngle = -burst * 0.035;
        swordAngle = -burst * 1.05;
      } else if (scene === 1) {
        bodyY += burst * 10;
        swordAngle = burst * 0.55;
      } else if (scene === 2) {
        bodyX = burst * 22;
        bodyAngle = burst * 0.045;
        swordAngle = burst * 0.78;
      } else if (scene === 3) {
        bodyAngle = Math.sin(active * Math.PI * 2) * 0.08;
        swordAngle = action < 1 ? active * Math.PI * 2 : 0;
      }

      const bodyCos = Math.cos(bodyAngle);
      const bodySin = Math.sin(bodyAngle);
      const swordCos = Math.cos(swordAngle);
      const swordSin = Math.sin(swordAngle);
      const pivotX = (layout.handX - layout.heroX) / layout.heroHeight;
      const pivotY = (layout.handY - layout.heroY) / layout.heroHeight;
      const finaleFade = finale ? 1 - clamp((active - 0.78) / 0.22) : 1;

      context.save();
      context.globalAlpha = finaleFade * alphaMultiplier;
      for (const particle of sceneParticles) {
        let rx = particle.rx;
        let ry = particle.ry;
        if (particle.group === "sword") {
          const localX = rx - pivotX;
          const localY = ry - pivotY;
          rx = pivotX + localX * swordCos - localY * swordSin;
          ry = pivotY + localX * swordSin + localY * swordCos;
        }
        let x = layout.heroX + (rx * bodyCos - ry * bodySin) * layout.heroHeight + bodyX;
        let y = layout.heroY + (rx * bodySin + ry * bodyCos) * layout.heroHeight + bodyY;
        const transformationEnvelope = Math.sin(clamp(active / 0.78) * Math.PI);
        if (!finale && scene === 1 && particle.group === "body") {
          x += (particle.seed - 0.5) * 58 * transformationEnvelope;
          y += Math.sin(particle.seed * 37) * 26 * transformationEnvelope;
        }
        if (!finale && scene === 2 && particle.group === "body" && particle.seed > 0.58) {
          const pageLift = (particle.seed - 0.58) * 92 * transformationEnvelope;
          x += Math.cos(particle.seed * 31) * pageLift;
          y -= pageLift * 0.72;
        }
        if (!finale && scene === 3 && particle.group === "body" && particle.seed > 0.7) {
          const networkX = coarsePointer ? width * 0.52 : width * 0.69;
          const networkY = coarsePointer ? height * 0.29 : height * 0.46;
          const pull = (particle.seed - 0.7) * transformationEnvelope * 0.62;
          x += (networkX - x) * pull;
          y += (networkY - y) * pull;
        }
        const shimmer = 0.58 + Math.sin(time * 0.004 + particle.seed * 18) * 0.24;
        context.globalAlpha = finaleFade * alphaMultiplier * shimmer;
        const palette = particle.group === "sword" ? bladeColors : sceneBodyColors[scene] ?? cloakColors;
        context.fillStyle = palette[particle.tone];
        if (!finale && scene === 1 && transformationEnvelope > 0.08 && particle.group === "body") {
          context.globalAlpha *= 0.28;
          context.fillRect(x - transformationEnvelope * 11, y, particle.size, particle.size);
          context.globalAlpha = finaleFade * alphaMultiplier * shimmer;
        }
        context.fillRect(x, y, particle.size, particle.size);
      }
      context.restore();
      context.globalAlpha = 1;
    };

    const drawScene = (time: number) => {
      context.fillStyle = "#07090d";
      context.fillRect(0, 0, width, height);
      const glow = context.createRadialGradient(layout.heroX, layout.heroY, 0, layout.heroX, layout.heroY, layout.heroHeight * 0.7);
      glow.addColorStop(0, "rgba(37, 66, 82, .18)");
      glow.addColorStop(1, "rgba(7, 9, 13, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      const elapsed = time - phaseStart;
      const sceneDurations = [1550, 1360, 1420, 1480];
      const action = clamp(elapsed / (sceneDurations[currentScene] ?? 860));
      if (currentScene === 0) drawDecisionGraph(time, action);
      if (currentScene === 1) drawColdPulse(time, action, 1);
      if (currentScene === 2) drawChessArchive(time, action, 1);
      if (currentScene === 3) drawPacketLanes(time, action, 1);
      const heroDurations = [720, 980, 920, 1050];
      const heroAction = clamp(elapsed / (heroDurations[currentScene] ?? 860));
      drawHero(time, currentScene, heroAction);
    };

    const drawFormEmblems = (time: number, progress: number) => {
      const converge = easeInOut(clamp((progress - 0.1) / 0.58));
      const chestX = layout.heroX + layout.heroHeight * 0.02;
      const chestY = layout.heroY - layout.heroHeight * 0.13;
      const orbitRadius = Math.min(width, height) * (0.31 - converge * 0.24);
      const colors = ["#eadb9c", "#6b9cff", "#fff2b8", "#8cddff"];
      const labels = ["Y", "R", "♞", "◎"];

      context.save();
      context.globalCompositeOperation = "lighter";
      colors.forEach((color, index) => {
        const angle = time * 0.00048 + index * Math.PI / 2 + converge * Math.PI * 0.72;
        const depth = 0.72 + Math.sin(angle) * 0.2;
        const x = chestX + Math.cos(angle) * orbitRadius;
        const y = chestY + Math.sin(angle) * orbitRadius * 0.44;
        const radius = (coarsePointer ? 13 : 18) * depth * (1 - converge * 0.18);
        context.globalAlpha = (0.3 + depth * 0.48) * (1 - clamp((progress - 0.79) / 0.18));
        context.strokeStyle = color;
        context.fillStyle = "rgba(7, 9, 13, .74)";
        context.shadowColor = color;
        context.shadowBlur = 22;
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.shadowBlur = 0;
        context.fillStyle = color;
        context.font = `${Math.max(9, radius * 0.85)}px ${index === 2 ? "Georgia, serif" : "ui-monospace, SFMono-Regular, Menlo, monospace"}`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(labels[index], x, y + 0.5);
        context.globalAlpha *= converge * 0.5;
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(chestX, chestY);
        context.stroke();
      });

      const core = clamp((progress - 0.46) / 0.3);
      const coreGlow = context.createRadialGradient(chestX, chestY, 0, chestX, chestY, layout.heroHeight * 0.23);
      coreGlow.addColorStop(0, `rgba(238, 252, 255, ${core * 0.42})`);
      coreGlow.addColorStop(0.24, `rgba(140, 221, 255, ${core * 0.17})`);
      coreGlow.addColorStop(1, "rgba(7, 9, 13, 0)");
      context.globalAlpha = 1;
      context.fillStyle = coreGlow;
      context.fillRect(chestX - layout.heroHeight * 0.25, chestY - layout.heroHeight * 0.25, layout.heroHeight * 0.5, layout.heroHeight * 0.5);
      context.restore();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      context.textAlign = "left";
      context.textBaseline = "alphabetic";
    };

    const drawFinalRift = (progress: number) => {
      const strike = easeOut(clamp((progress - 0.63) / 0.19));
      const opening = easeInOut(clamp((progress - 0.78) / 0.2));
      const startX = -width * 0.08;
      const startY = height * 1.08;
      const targetX = width * 1.08;
      const targetY = -height * 0.08;
      const endX = startX + (targetX - startX) * strike;
      const endY = startY + (targetY - startY) * strike;

      context.save();
      context.globalCompositeOperation = "lighter";
      context.globalAlpha = strike * (1 - opening * 0.72);
      context.strokeStyle = "#ffffff";
      context.shadowColor = "#8cddff";
      context.shadowBlur = 42;
      context.lineWidth = 3 + strike * 5;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
      context.strokeStyle = "#eadb9c";
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(startX - 16, startY + 8);
      context.lineTo(endX - 16, endY + 8);
      context.stroke();
      context.restore();

      if (opening > 0) {
        context.save();
        context.globalCompositeOperation = "destination-out";
        context.globalAlpha = opening;
        context.strokeStyle = "#000";
        context.lineWidth = opening * Math.hypot(width, height) * 1.35;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(targetX, targetY);
        context.stroke();
        context.restore();
      }
    };

    const drawFinale = (time: number) => {
      context.fillStyle = "#07090d";
      context.fillRect(0, 0, width, height);
      const elapsed = time - phaseStart;
      const progress = clamp(elapsed / 2280);
      const backgroundGlow = context.createRadialGradient(layout.heroX, layout.heroY, 0, layout.heroX, layout.heroY, layout.heroHeight * 0.82);
      backgroundGlow.addColorStop(0, `rgba(58, 103, 126, ${0.12 + progress * 0.1})`);
      backgroundGlow.addColorStop(0.5, `rgba(107, 156, 255, ${progress * 0.035})`);
      backgroundGlow.addColorStop(1, "rgba(7, 9, 13, 0)");
      context.fillStyle = backgroundGlow;
      context.fillRect(0, 0, width, height);
      drawFormEmblems(time, progress);
      drawHero(time, 3, progress, true);
      drawFinalRift(progress);
      if (elapsed > 2360) startExploring(false);
    };

    const drawExploring = (time: number) => {
      if (reducedMotion) {
        blade.x = width - (coarsePointer ? 26 : 43);
        blade.y = 82;
        blade.angle = 0;
        blade.scale = coarsePointer ? 82 : 108;
        followerPixels.forEach((pixel) => {
          context.globalAlpha = 0.42;
          context.fillStyle = "#07090d";
          context.fillRect(
            blade.x + pixel.x * blade.scale - 1,
            blade.y + pixel.y * blade.scale - 1,
            pixel.size + 2,
            pixel.size + 2,
          );
          context.globalAlpha = 0.58;
          context.fillStyle = bladeColors[pixel.tone];
          context.fillRect(blade.x + pixel.x * blade.scale, blade.y + pixel.y * blade.scale, pixel.size, pixel.size);
        });
        context.globalAlpha = 1;
        return;
      }
      const pointerIsFresh = pointer.active && time - pointer.lastMove < 820 && !coarsePointer;
      const scrolling = time - lastScroll < 150;
      const docked = !pointerIsFresh || scrolling;
      const targetX = docked ? width - (coarsePointer ? 26 : 43) : pointer.x - Math.cos(pointer.angle) * 66 - Math.sin(pointer.angle) * 26;
      const targetY = docked ? 82 + scrollProgress * Math.max(1, height - 164) : pointer.y - Math.sin(pointer.angle) * 66 + Math.cos(pointer.angle) * 26;
      const targetAngle = docked ? 0 : pointer.angle + Math.PI / 2;
      const targetScale = isHot && !docked ? 158 : docked ? (coarsePointer ? 82 : 108) : 136;

      blade.vx = (blade.vx + (targetX - blade.x) * 0.12) * 0.74;
      blade.vy = (blade.vy + (targetY - blade.y) * 0.12) * 0.74;
      blade.x += blade.vx;
      blade.y += blade.vy;
      let angleDifference = targetAngle - blade.angle;
      while (angleDifference > Math.PI) angleDifference -= Math.PI * 2;
      while (angleDifference < -Math.PI) angleDifference += Math.PI * 2;
      blade.angleVelocity = (blade.angleVelocity + angleDifference * 0.1) * 0.7;
      blade.angle += blade.angleVelocity;
      blade.scale += (targetScale - blade.scale) * 0.12;
      const cos = Math.cos(blade.angle);
      const sin = Math.sin(blade.angle);

      followerPixels.forEach((pixel) => {
        const x = blade.x + (pixel.x * cos - pixel.y * sin) * blade.scale;
        const y = blade.y + (pixel.x * sin + pixel.y * cos) * blade.scale;
        context.globalAlpha = 0.36;
        context.fillStyle = "#07090d";
        context.fillRect(x - 1, y - 1, pixel.size + 2, pixel.size + 2);
        context.globalAlpha = isHot ? 0.95 : 0.62 + Math.sin(time * 0.004 + pixel.seed * 16) * 0.22;
        context.fillStyle = bladeColors[pixel.tone];
        context.fillRect(x, y, pixel.size, pixel.size);
      });

      context.globalAlpha = 1;
      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.97;
        spark.vy *= 0.97;
        spark.life -= 0.026;
        if (spark.life <= 0) {
          sparks.splice(index, 1);
          continue;
        }
        context.fillStyle = `rgba(140, 221, 255, ${spark.life * 0.7})`;
        context.fillRect(spark.x, spark.y, spark.size, spark.size);
      }
      context.globalAlpha = 1;
    };

    const render = (time: number) => {
      if (!(currentPhase === "exploring" && reducedMotion)) frame = requestAnimationFrame(render);
      if (currentPhase === "waiting" && time - lastFrame < 32) return;
      lastFrame = time;
      context.clearRect(0, 0, width, height);
      if (currentPhase === "waiting") drawWaiting(time);
      else if (currentPhase === "assembling") drawAssembly(time);
      else if (currentPhase === "scene") drawScene(time);
      else if (currentPhase === "finale") drawFinale(time);
      else drawExploring(time);
    };

    resizeCanvas();
    if (reducedMotion || deepLink) buildFallbackFollower();
    else buildField();
    onScroll();
    frame = requestAnimationFrame(render);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    if (reducedMotion || deepLink) startExploring(true);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove("blade-locked");
      document.body.classList.remove("blade-locked");
    };
  }, []);

  const scene = experienceScenes[sceneIndex];
  const nextScene = experienceScenes[Math.min(sceneIndex + 1, experienceScenes.length - 1)];
  const liveMessage = phase === "scene"
    ? `${scene.organization}. ${scene.role}. ${scene.result}.`
    : phase === "exploring"
      ? "Experience overview complete. Portfolio ready."
      : phase === "finale"
        ? "Combining all four experience animations."
        : "A field of pixels waits to assemble.";

  return (
    <>
      <canvas
        ref={canvasRef}
        className={phase === "exploring" ? "blade-canvas is-exploring" : "blade-canvas"}
        aria-hidden="true"
      />

      {phase !== "exploring" && (
        <div
          className={`chronicle-shell is-${phase}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mahesh Karthikeyan experience overview"
          aria-describedby="experience-help"
        >
          <span className="sr-only" id="experience-help">
            Activate the screen to advance one role at a time. Press Escape or use Skip to open the full portfolio.
          </span>
          {phase === "waiting" && (
            <button
              type="button"
              className="blade-entry"
              aria-label="Assemble the cloaked hero and show Flex experience, 1 of 4"
              onClick={(event) => advanceRef.current(event.clientX, event.clientY)}
            >
              <span className="blade-entry-name" aria-hidden="true">
                <span data-text="Mahesh">Mahesh</span>
                <span data-text="Karthikeyan">Karthikeyan</span>
              </span>
            </button>
          )}

          {phase === "scene" && (
            <>
              {sceneIndex === 0 ? (
                <>
                  <div
                    className="chronicle-tree-stage"
                    role="region"
                    aria-label="Interactive underwriting decision tree. Drag to pan and scroll to zoom."
                  />
                  <div className="chronicle-tree-tools" aria-label="Decision tree view controls">
                    <span>Drag to pan · Scroll to zoom</span>
                    <button type="button" onClick={() => treeControlsRef.current.zoomOut()} aria-label="Zoom decision tree out">−</button>
                    <button type="button" onClick={() => treeControlsRef.current.reset()}>Reset</button>
                    <button type="button" onClick={() => treeControlsRef.current.zoomIn()} aria-label="Zoom decision tree in">+</button>
                  </div>
                  <div className="chronicle-tree-title" aria-hidden="true">
                    <span>Flex · Underwriting infrastructure</span>
                    <strong>Decision tree</strong>
                  </div>
                  <button
                    type="button"
                    className="chronicle-tree-next"
                    onClick={(event) => advanceRef.current(event.clientX, event.clientY)}
                  >
                    Continue <span>→</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="chronicle-advance"
                    aria-label={sceneIndex < experienceScenes.length - 1
                      ? `Show ${nextScene.organization} experience, ${sceneIndex + 2} of 4`
                      : "Play the combined finale and open the full portfolio"}
                    onClick={(event) => advanceRef.current(event.clientX, event.clientY)}
                  />
                  <article className={`chronicle-card scene-${sceneIndex}`} key={scene.organization} ref={cardRef} tabIndex={-1}>
                    <div className="chronicle-card-topline">
                      <span>{String(sceneIndex + 1).padStart(2, "0")} / 04</span>
                      <time>{scene.dates}</time>
                    </div>
                    <p>{scene.organization}</p>
                    <h2>{scene.role}</h2>
                    <span className="chronicle-focus">{scene.focus}</span>
                    <p className="chronicle-summary">{scene.summary}</p>
                    <strong>{scene.result}</strong>
                    <small>{scene.resultLabel}</small>
                  </article>
                </>
              )}
            </>
          )}

          {phase === "assembling" && (
            <div className="chronicle-forging" aria-hidden="true">
              <span>00 / 04</span>
              <i />
            </div>
          )}

          {phase === "finale" && (
            <div className="chronicle-finale" aria-hidden="true">
              <span>04 / 04</span>
              <strong>Experience assembled</strong>
            </div>
          )}

          <button
            type="button"
            className="chronicle-skip"
            aria-label="Skip experience overview and open the full portfolio"
            onClick={(event) => {
              event.stopPropagation();
              advanceRef.current(0, 0, true);
            }}
          >
            Skip
          </button>
        </div>
      )}

      <span className="sr-only" aria-live="polite">{liveMessage}</span>
    </>
  );
}
