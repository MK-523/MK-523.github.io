import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Phase = "waiting" | "assembling" | "landed" | "exploring";

type Particle = {
  sx: number;
  sy: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  delay: number;
  tile: number;
  size: number;
  seed: number;
  tone: number;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

const fieldColors = ["#07090d", "#090d13", "#0c1118", "#101821"];
const bladeColors = ["#d9f5ff", "#8cddff", "#6b9cff", "#f1f7f8"];

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

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

  context.beginPath();
  context.moveTo(centerX - width * 0.18, guardY + height * 0.035);
  context.lineTo(centerX + width * 0.16, guardY + height * 0.035);
  context.lineTo(centerX + width * 0.11, bottom - height * 0.055);
  context.lineTo(centerX - width * 0.14, bottom - height * 0.055);
  context.closePath();
  context.fill();

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
  fracture(top + height * 0.21, -1, Math.max(1.5, height * 0.003));
  fracture(top + height * 0.38, 1, Math.max(1.5, height * 0.0035));
  fracture(top + height * 0.54, -1, Math.max(1.5, height * 0.003));
  context.fillRect(centerX - height * 0.006, top + height * 0.09, height * 0.012, height * 0.49);
  context.restore();
}

export default function BladeExperience({ onReady }: { onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<(x: number, y: number, skip?: boolean) => void>(() => undefined);
  const onReadyRef = useRef(onReady);
  const [phase, setPhase] = useState<Phase>("waiting");

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    let width = Math.max(1, window.innerWidth);
    let height = Math.max(1, window.innerHeight);
    let currentPhase: Phase = "waiting";
    let phaseStart = performance.now();
    let frame = 0;
    let lastFrame = 0;
    let particles: Particle[] = [];
    let sparks: Spark[] = [];
    let exploreCount = 0;
    let scrollProgress = 0;
    let lastScroll = 0;
    let isHot = false;

    const pointer = {
      x: width / 2,
      y: height / 2,
      previousX: width / 2,
      previousY: height / 2,
      angle: -Math.PI / 2,
      speed: 0,
      lastMove: 0,
      active: false,
    };

    const blade = {
      x: width - 54,
      y: height * 0.2,
      vx: 0,
      vy: 0,
      angle: 0,
      angleVelocity: 0,
      scale: coarsePointer ? 92 : 122,
    };

    document.documentElement.classList.add("blade-locked");
    document.body.classList.add("blade-locked");
    window.scrollTo({ top: 0, left: 0 });

    const resizeCanvas = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.25 : 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const buildField = () => {
      const targetCount = coarsePointer ? 6000 : 12000;
      const tile = Math.max(coarsePointer ? 7 : 9, Math.ceil(Math.sqrt((width * height) / targetCount)));
      const swordHeight = Math.min(height * 0.78, width * 1.22, 820);
      const swordCenterX = width / 2;
      const swordCenterY = height / 2;
      const random = seededRandom(0x523a11);

      const mask = document.createElement("canvas");
      mask.width = Math.ceil(width);
      mask.height = Math.ceil(height);
      const maskContext = mask.getContext("2d", { willReadFrequently: true });
      if (!maskContext) return;
      drawBladeMask(maskContext, swordCenterX, swordCenterY, swordHeight);
      const maskData = maskContext.getImageData(0, 0, mask.width, mask.height).data;
      const sampleStep = coarsePointer ? 4 : 3;
      const targets: Array<{ x: number; y: number; rx: number; ry: number }> = [];

      for (let y = Math.max(0, Math.floor(swordCenterY - swordHeight * 0.5)); y < Math.min(height, swordCenterY + swordHeight * 0.52); y += sampleStep) {
        for (let x = Math.max(0, Math.floor(swordCenterX - swordHeight * 0.19)); x < Math.min(width, swordCenterX + swordHeight * 0.2); x += sampleStep) {
          const alpha = maskData[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3];
          if (alpha > 100 && random() > 0.08) {
            targets.push({
              x,
              y,
              rx: (x - swordCenterX) / swordHeight,
              ry: (y - swordCenterY) / swordHeight,
            });
          }
        }
      }

      for (let index = targets.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [targets[index], targets[swapIndex]] = [targets[swapIndex], targets[index]];
      }

      const next: Particle[] = [];
      let index = 0;
      for (let y = 0; y < height; y += tile) {
        for (let x = 0; x < width; x += tile) {
          const target = targets[index % Math.max(1, targets.length)] ?? {
            x: swordCenterX,
            y: swordCenterY,
            rx: 0,
            ry: 0,
          };
          next.push({
            sx: x + tile / 2,
            sy: y + tile / 2,
            x: x + tile / 2,
            y: y + tile / 2,
            tx: target.x,
            ty: target.y,
            cx: 0,
            cy: 0,
            rx: target.rx,
            ry: target.ry,
            delay: 0,
            tile: tile + 0.7,
            size: 1.05 + random() * 1.15,
            seed: random(),
            tone: Math.floor(random() * bladeColors.length),
          });
          index += 1;
        }
      }
      particles = next;
      exploreCount = Math.min(coarsePointer ? 680 : 1150, particles.length);
    };

    const unlock = () => {
      document.documentElement.classList.remove("blade-locked");
      document.body.classList.remove("blade-locked");
      onReadyRef.current();
    };

    const startExploring = (instant = false) => {
      currentPhase = "exploring";
      phaseStart = performance.now();
      setPhase("exploring");
      const dockX = width - (coarsePointer ? 30 : 46);
      const dockY = height * 0.2;
      blade.x = dockX;
      blade.y = dockY;
      blade.scale = coarsePointer ? 88 : 116;
      if (instant) {
        const cos = Math.cos(blade.angle);
        const sin = Math.sin(blade.angle);
        particles.slice(0, exploreCount).forEach((particle) => {
          particle.x = blade.x + (particle.rx * cos - particle.ry * sin) * blade.scale;
          particle.y = blade.y + (particle.rx * sin + particle.ry * cos) * blade.scale;
        });
      }
      unlock();
    };

    startRef.current = (clickX: number, clickY: number, skip = false) => {
      if (currentPhase !== "waiting") return;
      if (skip || reducedMotion) {
        startExploring(true);
        return;
      }

      const originX = clickX > 0 ? clickX : width / 2;
      const originY = clickY > 0 ? clickY : height / 2;
      const random = seededRandom(0x523b1ade);
      const maximumDistance = Math.hypot(width, height);
      particles.forEach((particle) => {
        const dx = particle.tx - particle.sx;
        const dy = particle.ty - particle.sy;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const bend = (random() - 0.5) * Math.min(280, distance * 0.52);
        particle.cx = (particle.sx + particle.tx) / 2 - (dy / distance) * bend;
        particle.cy = (particle.sy + particle.ty) / 2 + (dx / distance) * bend;
        particle.delay = (Math.hypot(particle.sx - originX, particle.sy - originY) / maximumDistance) * 210 + random() * 130;
      });
      currentPhase = "assembling";
      phaseStart = performance.now();
      setPhase("assembling");
    };

    const addSpark = (x: number, y: number, vx: number, vy: number) => {
      sparks.push({ x, y, vx, vy, life: 1, size: 0.8 + Math.random() * 1.6 });
      if (sparks.length > 90) sparks = sparks.slice(-90);
    };

    const onPointerMove = (event: PointerEvent) => {
      const nextX = event.clientX;
      const nextY = event.clientY;
      const dx = nextX - pointer.x;
      const dy = nextY - pointer.y;
      const distance = Math.hypot(dx, dy);
      pointer.previousX = pointer.x;
      pointer.previousY = pointer.y;
      pointer.x = nextX;
      pointer.y = nextY;
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
      if (event.key === "Escape" && currentPhase !== "exploring") startExploring(true);
    };

    const onResize = () => {
      resizeCanvas();
      if (currentPhase === "waiting") buildField();
      else if (currentPhase !== "exploring") startExploring(true);
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
        const flicker = Math.sin(time * 0.001 + particle.seed * 18) > 0.94 ? 1 : 0;
        context.fillStyle = flicker ? "#152432" : fieldColors[Math.floor(particle.seed * fieldColors.length)];
        context.fillRect(Math.floor(x - particle.tile / 2), Math.floor(y - particle.tile / 2), particle.tile + 0.6, particle.tile + 0.6);
      }
    };

    const drawAssembly = (time: number) => {
      const elapsed = time - phaseStart;
      const duration = 1050;
      for (const particle of particles) {
        const progress = clamp((elapsed - particle.delay) / duration);
        const eased = 1 - Math.pow(1 - progress, 4);
        const inverse = 1 - eased;
        particle.x = inverse * inverse * particle.sx + 2 * inverse * eased * particle.cx + eased * eased * particle.tx;
        particle.y = inverse * inverse * particle.sy + 2 * inverse * eased * particle.cy + eased * eased * particle.ty;
        const size = particle.tile * (1 - eased) + particle.size * eased;
        context.fillStyle = progress < 0.7 ? fieldColors[Math.floor(particle.seed * fieldColors.length)] : bladeColors[particle.tone];
        context.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
      }

      if (elapsed > 1460) {
        currentPhase = "landed";
        phaseStart = time;
        setPhase("landed");
      }
    };

    const drawLanded = (time: number) => {
      const pulse = 0.88 + Math.sin((time - phaseStart) * 0.018) * 0.12;
      for (const particle of particles) {
        context.globalAlpha = pulse;
        context.fillStyle = bladeColors[particle.tone];
        context.fillRect(particle.tx - particle.size / 2, particle.ty - particle.size / 2, particle.size, particle.size);
      }
      context.globalAlpha = 1;
      if (time - phaseStart > 330) startExploring(false);
    };

    const drawExploring = (time: number) => {
      const pointerIsFresh = pointer.active && time - pointer.lastMove < 820 && !coarsePointer;
      const scrolling = time - lastScroll < 150;
      const docked = !pointerIsFresh || scrolling;
      const targetX = docked
        ? width - (coarsePointer ? 26 : 43)
        : pointer.x - Math.cos(pointer.angle) * 66 - Math.sin(pointer.angle) * 26;
      const targetY = docked
        ? 82 + scrollProgress * Math.max(1, height - 164)
        : pointer.y - Math.sin(pointer.angle) * 66 + Math.cos(pointer.angle) * 26;
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
      const settle = clamp((time - phaseStart) / 520);
      const activeParticles = particles.slice(0, exploreCount);
      activeParticles.forEach((particle, index) => {
        const targetParticleX = blade.x + (particle.rx * cos - particle.ry * sin) * blade.scale;
        const targetParticleY = blade.y + (particle.rx * sin + particle.ry * cos) * blade.scale;
        const lag = 0.17 - (index % 7) * 0.006;
        particle.x += (targetParticleX - particle.x) * (settle < 1 ? 0.11 : lag);
        particle.y += (targetParticleY - particle.y) * (settle < 1 ? 0.11 : lag);
        const shimmer = 0.64 + Math.sin(time * 0.004 + particle.seed * 16) * 0.23;
        context.globalAlpha = isHot ? 0.95 : shimmer;
        context.fillStyle = bladeColors[particle.tone];
        context.fillRect(particle.x, particle.y, particle.size, particle.size);
      });

      if (settle < 1) {
        const fade = 1 - settle;
        context.globalAlpha = fade * 0.5;
        for (let index = exploreCount; index < particles.length; index += 3) {
          const particle = particles[index];
          context.fillStyle = bladeColors[particle.tone];
          context.fillRect(particle.tx, particle.ty, particle.size, particle.size);
        }
      }

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
      frame = requestAnimationFrame(render);
      if (currentPhase === "waiting" && time - lastFrame < 32) return;
      lastFrame = time;
      context.clearRect(0, 0, width, height);
      if (currentPhase === "waiting") drawWaiting(time);
      else if (currentPhase === "assembling") drawAssembly(time);
      else if (currentPhase === "landed") drawLanded(time);
      else drawExploring(time);
    };

    resizeCanvas();
    buildField();
    onScroll();
    frame = requestAnimationFrame(render);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove("blade-locked");
      document.body.classList.remove("blade-locked");
    };
  }, []);

  const start = (event: ReactPointerEvent<HTMLButtonElement>) => {
    startRef.current(event.clientX, event.clientY);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className={phase === "exploring" ? "blade-canvas is-exploring" : "blade-canvas"}
        aria-hidden="true"
      />
      {phase === "waiting" && (
        <button
          type="button"
          className="blade-entry"
          aria-label="Reveal Mahesh Karthikeyan's portfolio"
          onPointerDown={start}
          onClick={(event) => startRef.current(event.clientX, event.clientY)}
        >
          <span className="blade-entry-name">Mahesh Karthikeyan</span>
        </button>
      )}
      <span className="sr-only" aria-live="polite">
        {phase === "exploring" ? "Blade forged. Portfolio ready." : "A field of pixels. Click to reveal the portfolio."}
      </span>
    </>
  );
}
