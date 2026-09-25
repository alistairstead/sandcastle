import { describe, expect, it } from "vitest";

import { createIdleClock, SUSPEND_THRESHOLD_MS } from "./IdleClock.js";

const fakeNow = (start = 0) => {
  let t = start;
  return {
    advance: (ms: number) => {
      t += ms;
    },
    now: () => t,
  };
};

describe(createIdleClock, () => {
  it("accumulates the time between ticks", () => {
    const time = fakeNow();
    const clock = createIdleClock({ now: time.now });

    time.advance(1000);
    expect(clock.tick()).toBe(1000);
    time.advance(2000);
    expect(clock.tick()).toBe(3000);
  });

  it("does not count a gap longer than the suspend threshold", () => {
    const time = fakeNow();
    const clock = createIdleClock({ now: time.now });

    time.advance(1000);
    clock.tick();
    time.advance(80 * 60_000);
    expect(clock.tick()).toBe(1000);
    time.advance(1000);
    expect(clock.tick()).toBe(2000);
  });

  it("counts a gap up to the suspend threshold", () => {
    const time = fakeNow();
    const clock = createIdleClock({ now: time.now });

    time.advance(SUSPEND_THRESHOLD_MS);
    expect(clock.tick()).toBe(SUSPEND_THRESHOLD_MS);
  });

  it("does not count a clock that moved backwards", () => {
    const time = fakeNow(10_000);
    const clock = createIdleClock({ now: time.now });

    time.advance(-5000);
    expect(clock.tick()).toBe(0);
    time.advance(1000);
    expect(clock.tick()).toBe(1000);
  });

  it("starts again from zero on reset", () => {
    const time = fakeNow();
    const clock = createIdleClock({ now: time.now });

    time.advance(5000);
    clock.tick();
    clock.reset();
    time.advance(1000);
    expect(clock.tick()).toBe(1000);
  });
});
