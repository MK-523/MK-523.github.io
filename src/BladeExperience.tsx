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

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 4);

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
      if (currentPhase !== "scene" || now - phaseStart < 960 || now - lastAdvance < 960) return;
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
      if (currentPhase === "exploring" && distance > 6 && Math.random() > 0.45) {
        addSpark(blade.x, blade.y, -dx * 0.025 + (Math.random() - 0.5), -dy * 0.025 + (Math.random() - 0.5));
      }
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

    const drawDecisionGraph = (time: number, alpha: number) => {
      const originX = coarsePointer ? width * 0.76 : width * 0.69;
      const originY = coarsePointer ? height * 0.24 : height * 0.34;
      const nodes = [
        [-0.18, -0.15], [0.02, -0.23], [0.2, -0.08], [-0.08, 0.02], [0.14, 0.12], [-0.2, 0.2], [0.02, 0.27],
      ];
      const scale = Math.min(width, height) * (coarsePointer ? 0.38 : 0.32);
      context.save();
      context.globalAlpha = alpha * 0.42;
      context.strokeStyle = "#8cddff";
      context.lineWidth = 1;
      context.beginPath();
      [[0, 1], [1, 2], [0, 3], [3, 4], [3, 5], [5, 6]].forEach(([from, to]) => {
        context.moveTo(originX + nodes[from][0] * scale, originY + nodes[from][1] * scale);
        context.lineTo(originX + nodes[to][0] * scale, originY + nodes[to][1] * scale);
      });
      context.stroke();
      nodes.forEach(([x, y], index) => {
        const pulse = 2.2 + Math.sin(time * 0.006 + index) * 1.1;
        context.fillStyle = index % 2 ? "#8cddff" : "#d9f5ff";
        context.fillRect(originX + x * scale - pulse / 2, originY + y * scale - pulse / 2, pulse, pulse);
      });
      context.restore();
    };

    const drawColdPulse = (progress: number, alpha: number) => {
      const x = layout.handX;
      const y = coarsePointer
        ? layout.heroY - layout.heroHeight * 0.12
        : layout.heroY + layout.heroHeight * 0.43;
      context.save();
      context.globalAlpha = alpha * (1 - progress) * 0.55;
      context.strokeStyle = "#8cddff";
      context.lineWidth = 1.2;
      [0, 0.22, 0.44].forEach((offset) => {
        const radius = clamp(progress + offset) * layout.heroHeight * 0.52;
        context.beginPath();
        context.ellipse(x, y, radius, radius * 0.26, 0, 0, Math.PI * 2);
        context.stroke();
      });
      context.restore();
    };

    const drawChessArchive = (progress: number, alpha: number) => {
      const size = Math.max(18, Math.min(38, width / 24));
      const startX = coarsePointer ? width * 0.1 : width * 0.58;
      const startY = coarsePointer ? height * 0.18 : height * 0.16;
      context.save();
      context.globalAlpha = alpha * 0.18;
      for (let row = 0; row < 7; row += 1) {
        for (let column = 0; column < 7; column += 1) {
          if ((row + column) % 2 === 0 && (row * 7 + column) / 49 < progress + 0.16) {
            context.fillStyle = row % 2 ? "#8cddff" : "#d9f5ff";
            context.fillRect(startX + column * size, startY + row * size, size - 2, size - 2);
          }
        }
      }
      context.globalAlpha = alpha * 0.34;
      context.fillStyle = "#d9f5ff";
      context.font = `${size * 2.4}px serif`;
      context.fillText("♞", startX + size * 2.3, startY + size * 5.5);
      context.restore();
    };

    const drawPacketLanes = (time: number, alpha: number) => {
      const startY = coarsePointer ? height * 0.18 : height * 0.24;
      context.save();
      context.globalAlpha = alpha * 0.32;
      for (let lane = 0; lane < 6; lane += 1) {
        const y = startY + lane * Math.min(48, height * 0.065);
        context.strokeStyle = lane % 2 ? "#6b9cff" : "#8cddff";
        context.beginPath();
        context.moveTo(width * 0.5, y);
        context.bezierCurveTo(width * 0.62, y - 18, width * 0.77, y + 22, width * 0.94, y);
        context.stroke();
        for (let packet = 0; packet < 4; packet += 1) {
          const position = (time * 0.00018 + packet * 0.25 + lane * 0.07) % 1;
          const x = width * (0.5 + position * 0.44);
          context.fillStyle = "#d9f5ff";
          context.fillRect(x, y + Math.sin(position * Math.PI * 2 + lane) * 8, 3, 3);
        }
      }
      context.restore();
    };

    const drawHero = (time: number, scene: number, action: number, finale = false, alphaMultiplier = 1) => {
      const active = action < 1 ? action : 1;
      const burst = action < 1 ? Math.sin(active * Math.PI) : 0;
      let bodyX = 0;
      let bodyY = Math.sin(time * 0.0018) * 1.5;
      let bodyAngle = 0;
      let swordAngle = 0;

      if (finale) {
        bodyX = Math.sin(active * Math.PI * 4) * 12;
        bodyY += Math.sin(active * Math.PI * 6) * 7;
        bodyAngle = Math.sin(active * Math.PI * 4) * 0.08;
        swordAngle = active * Math.PI * 4 + Math.sin(active * Math.PI * 7) * 0.5;
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
        const x = layout.heroX + (rx * bodyCos - ry * bodySin) * layout.heroHeight + bodyX;
        const y = layout.heroY + (rx * bodySin + ry * bodyCos) * layout.heroHeight + bodyY;
        const shimmer = 0.58 + Math.sin(time * 0.004 + particle.seed * 18) * 0.24;
        context.globalAlpha = finaleFade * alphaMultiplier * shimmer;
        const palette = particle.group === "sword" ? bladeColors : cloakColors;
        context.fillStyle = palette[particle.tone];
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
      const action = clamp((time - phaseStart) / 860);
      if (currentScene === 0) drawDecisionGraph(time, action);
      if (currentScene === 1) drawColdPulse(action, 1);
      if (currentScene === 2) drawChessArchive(action, 1);
      if (currentScene === 3) drawPacketLanes(time, action);
      drawHero(time, currentScene, action);
    };

    const drawFinale = (time: number) => {
      context.fillStyle = "#07090d";
      context.fillRect(0, 0, width, height);
      const elapsed = time - phaseStart;
      const progress = clamp(elapsed / 1800);
      drawDecisionGraph(time, 1 - progress * 0.25);
      drawColdPulse((progress * 2.4) % 1, 1);
      drawChessArchive(clamp(progress * 1.5), 1 - progress * 0.25);
      drawPacketLanes(time, 1);
      const echoAlpha = (1 - clamp((progress - 0.68) / 0.28)) * 0.2;
      [0, 1, 2, 3].forEach((scene, index) => {
        const action = clamp(progress * 1.55 - index * 0.07);
        drawHero(time + index * 90, scene, action, false, echoAlpha);
      });
      drawHero(time, 3, progress, true);
      if (elapsed > 1880) startExploring(false);
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
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    if (reducedMotion || deepLink) startExploring(true);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("pointermove", onPointerMove);
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
              <button
                type="button"
                className="chronicle-advance"
                aria-label={sceneIndex < experienceScenes.length - 1
                  ? `Show ${nextScene.organization} experience, ${sceneIndex + 2} of 4`
                  : "Play the combined finale and open the full portfolio"}
                onClick={(event) => advanceRef.current(event.clientX, event.clientY)}
              />
              <article className="chronicle-card" key={scene.organization} ref={cardRef} tabIndex={-1}>
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
