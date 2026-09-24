import { describe, expect, it } from "vitest";
import { cameraAt } from "./lake-renderer";

describe("forward lake camera", () => {
  it("gets closer to the mountains as time passes without input", () => {
    const positions = [0, 10, 30, 60, 300, 3600].map((seconds) =>
      cameraAt(0, seconds),
    );
    for (let i = 1; i < positions.length; i++)
      expect(positions[i].z).toBeLessThan(positions[i - 1].z);
    expect(
      positions.every((camera) => camera.x === 0 && camera.yaw === 0),
    ).toBe(true);
  });
  it("advances at every stop while staying safely on the lake during long visits", () => {
    for (const seconds of [0, 120, 86400]) {
      let previous = cameraAt(0, seconds).z;
      for (let step = 1; step <= 5; step++) {
        const camera = cameraAt(step / 5, seconds);
        expect(camera.z).toBeLessThan(previous);
        expect(camera.z).toBeGreaterThan(-250);
        previous = camera.z;
      }
    }
  });
});
