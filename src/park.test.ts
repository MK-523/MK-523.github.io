import { describe, expect, it } from "vitest";
import {
  cameraFor,
  attractions,
  discoveries,
  WORLD,
  findPath,
  lineWalkable,
  locations,
  nearestPlace,
  START,
  stepPosition,
  walkable,
} from "./park";
describe("park navigation geometry", () => {
  it("keeps all six destinations reachable from the entrance and each other", () => {
    for (const start of [START, ...locations.map((l) => l.entrance)])
      for (const destination of locations) {
        const route = findPath(start, destination.entrance);
        expect(route.length).toBeGreaterThan(0);
        let previous = start;
        for (const point of route) {
          expect(walkable(point)).toBe(true);
          expect(lineWalkable(previous, point)).toBe(true);
          previous = point;
        }
        expect(previous).toEqual(destination.entrance);
        expect(nearestPlace(previous)?.id).toBe(destination.id);
      }
  });
  it("blocks the pond, buildings, tree trunks and world boundaries while allowing the bridge", () => {
    expect(walkable({ x: 963, y: 510 })).toBe(false);
    expect(walkable({ x: 963, y: 590 })).toBe(true);
    expect(walkable({ x: 400, y: 360 })).toBe(false);
    expect(walkable({ x: 210, y: 600 })).toBe(false);
    expect(walkable({ x: 20, y: 200 })).toBe(false);
    expect(lineWalkable({ x: 725, y: 590 }, { x: 1210, y: 590 })).toBe(true);
    let p = { x: 963, y: 765 };
    for (let i = 0; i < 150; i++) p = stepPosition(p, 0, -4);
    expect(p.y).toBeGreaterThanOrEqual(736);
  });
  it("connects the expanded attractions and optional collectibles with safe routes", () => {
    for (const start of [START, ...attractions])
      for (const destination of [...attractions, ...discoveries]) {
        expect(walkable(destination)).toBe(true);
        const route = findPath(start, destination);
        expect(route.length).toBeGreaterThan(0);
        let previous = start;
        for (const point of route) {
          expect(lineWalkable(previous, point)).toBe(true);
          previous = point;
        }
        expect(previous).toEqual(destination);
      }
    expect(walkable({ x: 2480, y: 505 })).toBe(false);
    expect(walkable({ x: 2570, y: 1700 })).toBe(false);
    expect(lineWalkable({ x: 2240, y: 1555 }, { x: 2880, y: 1555 })).toBe(true);
    expect(walkable({ x: 350, y: 1440 })).toBe(false);
  });
  it("routes blocked clicks to nearby safe ground", () => {
    const route = findPath(START, { x: 963, y: 510 });
    expect(route.length).toBeGreaterThan(0);
    expect(walkable(route.at(-1)!)).toBe(true);
  });
  it("clamps the camera at the edges", () => {
    expect(cameraFor({ x: 0, y: 0 }, 1000, 700, 1)).toEqual({ x: 0, y: 0 });
    expect(
      cameraFor({ x: WORLD.width, y: WORLD.height }, 1000, 700, 1),
    ).toEqual({
      x: WORLD.width - 1000,
      y: WORLD.height - 700,
    });
  });
});
