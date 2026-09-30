export type Point = { x: number; y: number };
export const WORLD = { width: 3000, height: 2200 };
export const START: Point = { x: 865, y: 865 };
export const locations = [
  {
    id: "projects",
    name: "The workshop",
    category: "Projects",
    icon: "⌘",
    x: 430,
    y: 405,
    entrance: { x: 440, y: 512 },
  },
  {
    id: "experience",
    name: "The greenhouse",
    category: "Experience",
    icon: "♧",
    x: 1310,
    y: 390,
    entrance: { x: 1305, y: 505 },
  },
  {
    id: "about",
    name: "The reading grove",
    category: "About me",
    icon: "☷",
    x: 1155,
    y: 865,
    entrance: { x: 1110, y: 885 },
  },
  {
    id: "contact",
    name: "The postbox",
    category: "Contact",
    icon: "↗",
    x: 520,
    y: 915,
    entrance: { x: 585, y: 940 },
  },
  {
    id: "campus",
    name: "The campsite",
    category: "Community",
    icon: "△",
    x: 1500,
    y: 810,
    entrance: { x: 1450, y: 900 },
  },
  {
    id: "awards",
    name: "The lookout",
    category: "Milestones",
    icon: "✧",
    x: 865,
    y: 240,
    entrance: { x: 865, y: 350 },
  },
] as const;
export type PlaceId = (typeof locations)[number]["id"];
export const trees = [
  [85, 140, 1.3],
  [185, 100, 1.1],
  [310, 130, 1.5],
  [495, 120, 1.25],
  [625, 175, 1.1],
  [730, 95, 1.4],
  [1060, 125, 1.2],
  [1190, 170, 1.3],
  [1420, 95, 1.4],
  [1575, 155, 1.2],
  [1700, 105, 1.5],
  [90, 335, 1.2],
  [195, 270, 1.35],
  [275, 350, 0.9],
  [90, 520, 1.6],
  [210, 600, 1.2],
  [110, 755, 1.1],
  [230, 875, 1.4],
  [125, 1030, 1.55],
  [295, 1100, 1.3],
  [385, 1015, 0.85],
  [1710, 330, 1.3],
  [1600, 460, 1],
  [1740, 565, 1.4],
  [1630, 650, 1.1],
  [1730, 820, 1.4],
  [1650, 1010, 1.3],
  [1520, 1120, 1.4],
  [1370, 1080, 1.2],
  [1215, 1130, 1.5],
  [1010, 1110, 1.25],
  [800, 1100, 1.4],
  [630, 1130, 1.15],
  [500, 1070, 1.25],
  [1090, 745, 0.95],
  [1210, 775, 1.2],
  [1300, 890, 1.1],
  [1260, 1005, 0.9],
  [360, 660, 1.1],
  [580, 365, 0.8],
  [690, 650, 0.9],
  [1550, 275, 0.8],
  // Trees frame the new trails while leaving their junctions open.
  [1830, 180, 1.4],
  [2010, 170, 1.1],
  [2170, 180, 1.3],
  [2840, 180, 1.5],
  [2940, 370, 1.2],
  [1880, 430, 1.2],
  [2020, 590, 1.3],
  [2870, 740, 1.4],
  [1850, 1070, 1.2],
  [2100, 1080, 1.4],
  [2310, 1000, 1.1],
  [2700, 1100, 1.3],
  [2860, 1090, 1.2],
  [2950, 1280, 1.5],
  [2860, 1420, 1],
  [2950, 1640, 1.4],
  [2960, 1960, 1.2],
  [2760, 2120, 1.4],
  [2560, 2100, 1.3],
  [2300, 2110, 1.4],
  [2140, 1930, 1.4],
  [2110, 1730, 1.2],
  [2150, 1430, 1.3],
  [1900, 1290, 1.3],
  [1700, 1270, 1.3],
  [1510, 1350, 1.1],
  [1370, 1260, 1.4],
  [1160, 1260, 1.1],
  [910, 1330, 1.3],
  [1030, 1520, 1.2],
  [1110, 1750, 1.3],
  [1070, 1930, 1.3],
  [1250, 2090, 1.3],
  [1490, 2110, 1.4],
  [1800, 2100, 1.3],
  [1960, 1950, 1.4],
  [200, 1340, 1.3],
  [150, 1560, 1.4],
  [170, 1840, 1.4],
  [330, 2070, 1.3],
  [540, 2120, 1.3],
  [820, 2110, 1.1],
  [1200, 1470, 1.3],
  [1900, 1510, 1.2],
].map(([x, y, scale], i) => ({ x, y, scale, variant: i % 3 }));

export const trailPaths =
  "M1480 905Q1730 890 1950 900Q2180 890 2360 735M1950 900Q2080 1150 1980 1420Q1840 1530 1580 1850M315 1100Q410 1340 680 1430Q900 1490 800 1720Q740 1920 1010 1950Q1300 2010 1580 1850Q1930 1650 2240 1820Q2570 1990 2860 1830M2360 735Q2690 960 2790 1130Q2870 1340 2860 1555H2260Q2210 1440 1980 1420M680 1430Q400 1510 470 1750Q520 1900 800 1720M800 1720Q875 1730 930 1770M1580 1850Q1720 2010 1770 1910M2360 735Q2560 830 2760 840M2860 1830 2840 1880";
export const corePaths =
  "M315 1100Q355 972 498 927Q678 869 758 832Q863 773 1046 811Q1240 850 1480 905Q1645 916 1674 1017M440 510Q410 642 521 735Q574 783 758 832M440 510Q627 403 869 356Q1100 390 1305 505Q1357 645 1460 710Q1510 778 1480 905M560 714Q638 605 761 591H1220Q1291 570 1305 505M1046 811Q1100 838 1110 885";
export const attractions = [
  { id: "waterfall", name: "Waterfall", icon: "≈", x: 2360, y: 735 },
  { id: "orchard", name: "Orchard", icon: "❀", x: 930, y: 1770 },
  { id: "stones", name: "Stone circle", icon: "◈", x: 1580, y: 1850 },
  { id: "pavilion", name: "Island pavilion", icon: "⌂", x: 2570, y: 1555 },
] as const;
export const discoveries = [
  { id: "apple", name: "Apple", icon: "●", x: 470, y: 1750 },
  { id: "crystal", name: "Crystal", icon: "◆", x: 1770, y: 1910 },
  { id: "shell", name: "Shell", icon: "◉", x: 2760, y: 840 },
  { id: "feather", name: "Feather", icon: "❧", x: 2840, y: 1880 },
] as const;
export const orchardTrees = Array.from({ length: 12 }, (_, i) => ({
  x: 350 + (i % 4) * 155,
  y: 1440 + Math.floor(i / 4) * 185,
}));
export const standingStones = Array.from({ length: 7 }, (_, i) => ({
  x: 1580 + Math.cos((i / 7) * Math.PI * 2) * 170,
  y: 1660 + Math.sin((i / 7) * Math.PI * 2) * 115,
}));
export const lakes = [
  { x: 963, y: 591, rx: 235, ry: 145, bridge: [567, 616] },
  { x: 2480, y: 505, rx: 270, ry: 170, bridge: null },
  { x: 2570, y: 1550, rx: 300, ry: 220, bridge: [1530, 1580] },
] as const;

export const obstacles = [
  { x: 2515, y: 1380, w: 110, h: 100 },
  { x: 2300, y: 260, w: 350, h: 95 },
  { x: 340, y: 280, w: 185, h: 155 },
  { x: 1195, y: 265, w: 230, h: 160 },
  { x: 807, y: 165, w: 116, h: 100 },
  { x: 1460, y: 707, w: 135, h: 113 },
  { x: 500, y: 865, w: 42, h: 72 },
  { x: 1112, y: 808, w: 110, h: 40 },
];
export function walkable(p: Point): boolean {
  if (
    p.x < 60 ||
    p.x > WORLD.width - 60 ||
    p.y < 100 ||
    p.y > WORLD.height - 70
  )
    return false;
  if (
    lakes.some(
      (l) =>
        ((p.x - l.x) / l.rx) ** 2 + ((p.y - l.y) / l.ry) ** 2 < 1 &&
        !(l.bridge && p.y >= l.bridge[0] && p.y <= l.bridge[1]),
    )
  )
    return false;
  if (
    orchardTrees.some((t) => Math.hypot(p.x - t.x, p.y - t.y) < 22) ||
    standingStones.some((t) => Math.hypot(p.x - t.x, p.y - t.y) < 28)
  )
    return false;
  if (
    obstacles.some(
      (o) =>
        p.x > o.x - 13 &&
        p.x < o.x + o.w + 13 &&
        p.y > o.y - 10 &&
        p.y < o.y + o.h + 13,
    )
  )
    return false;
  if (trees.some((t) => Math.hypot(p.x - t.x, p.y - t.y) < 18 * t.scale))
    return false;
  return true;
}
export function stepPosition(p: Point, dx: number, dy: number): Point {
  const next = { x: p.x + dx, y: p.y + dy };
  if (walkable(next)) return next;
  if (walkable({ x: p.x + dx, y: p.y })) return { x: p.x + dx, y: p.y };
  if (walkable({ x: p.x, y: p.y + dy })) return { x: p.x, y: p.y + dy };
  return p;
}
export function nearestPlace(p: Point) {
  return locations.find(
    (l) => Math.hypot(l.entrance.x - p.x, l.entrance.y - p.y) < 104,
  );
}
export function lineWalkable(a: Point, b: Point) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8);
  for (let i = 1; i <= n; i++)
    if (
      !walkable({
        x: a.x + ((b.x - a.x) * i) / n,
        y: a.y + ((b.y - a.y) * i) / n,
      })
    )
      return false;
  return true;
}
const GRID = 24;
let navigationNodes: { key: number; p: Point }[] | null = null;
export function findPath(start: Point, target: Point): Point[] {
  if (walkable(target) && lineWalkable(start, target)) return [target];
  const cols = Math.floor(WORLD.width / GRID),
    rows = Math.floor(WORLD.height / GRID);
  const point = (key: number) => ({
    x: (key % cols) * GRID,
    y: Math.floor(key / cols) * GRID,
  });
  if (!navigationNodes) {
    navigationNodes = [];
    for (let y = 4; y < rows - 2; y++)
      for (let x = 3; x < cols - 2; x++) {
        const p = { x: x * GRID, y: y * GRID };
        if (walkable(p)) navigationNodes.push({ key: y * cols + x, p });
      }
  }
  const closest = (p: Point) => {
    let best = -1,
      distance = Infinity;
    for (const node of navigationNodes!) {
      const d = (p.x - node.p.x) ** 2 + (p.y - node.p.y) ** 2;
      if (d < distance) {
        distance = d;
        best = node.key;
      }
    }
    return best;
  };
  const first = closest(start),
    last = closest(target);
  if (first < 0 || last < 0) return [];
  const open = new Set([first]),
    closed = new Set<number>(),
    from = new Map<number, number>(),
    cost = new Map([[first, 0]]);
  const heuristic = (k: number) =>
    Math.hypot(point(k).x - point(last).x, point(k).y - point(last).y);
  let found = false;
  while (open.size) {
    let current = -1,
      score = Infinity;
    for (const k of open) {
      const s = cost.get(k)! + heuristic(k);
      if (s < score) {
        current = k;
        score = s;
      }
    }
    if (current === last) {
      found = true;
      break;
    }
    open.delete(current);
    closed.add(current);
    const p = point(current);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const x = (current % cols) + dx,
        y = Math.floor(current / cols) + dy;
      if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
      const k = y * cols + x,
        q = point(k);
      if (closed.has(k) || !walkable(q) || !lineWalkable(p, q)) continue;
      const candidate = cost.get(current)! + Math.hypot(dx, dy) * GRID;
      if (candidate < (cost.get(k) ?? Infinity)) {
        from.set(k, current);
        cost.set(k, candidate);
        open.add(k);
      }
    }
  }
  if (!found) return [];
  const path = [point(last)];
  let k = last;
  while (k !== first) {
    k = from.get(k)!;
    path.unshift(point(k));
  }
  if (walkable(target) && lineWalkable(path[path.length - 1], target))
    path.push(target);
  const result: Point[] = [];
  let anchor = start,
    index = 0;
  while (index < path.length) {
    let far = index;
    while (far + 1 < path.length && lineWalkable(anchor, path[far + 1])) far++;
    result.push(path[far]);
    anchor = path[far];
    index = far + 1;
  }
  return result;
}
export function cameraFor(
  player: Point,
  width: number,
  height: number,
  scale: number,
): Point {
  return {
    x: Math.max(
      0,
      Math.min(WORLD.width - width / scale, player.x - width / scale / 2),
    ),
    y: Math.max(
      0,
      Math.min(
        WORLD.height - height / scale,
        player.y - (height / scale) * 0.58,
      ),
    ),
  };
}
