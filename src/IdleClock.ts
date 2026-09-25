/**
 * A gap between two ticks longer than this is taken to be the host suspending
 * (e.g. a laptop lid closing), not the agent going quiet. Ticks run at most a
 * second apart, so a healthy event loop never comes close.
 */
export const SUSPEND_THRESHOLD_MS = 10_000;

export interface IdleClock {
  /** Starts counting idleness again from zero. */
  readonly reset: () => void;
  /** Records the time since the previous tick and returns total idle time in ms. */
  readonly tick: () => number;
}

/**
 * Measures how long an agent has been idle in host-awake time.
 *
 * macOS sends no signal on sleep, and a timer pending across a suspend can
 * fire as soon as the host wakes, so the idle timeout used to kill agents
 * that were only frozen. Sampling wall-clock time on every tick makes the
 * suspend visible as one oversized gap, which is dropped rather than counted.
 * A clock that moved backwards (an NTP correction) is dropped the same way.
 */
export const createIdleClock = ({
  now = Date.now,
}: { readonly now?: () => number } = {}): IdleClock => {
  let last = now();
  let idleMs = 0;
  return {
    reset: () => {
      last = now();
      idleMs = 0;
    },
    tick: () => {
      const current = now();
      const gap = current - last;
      last = current;
      if (gap > 0 && gap <= SUSPEND_THRESHOLD_MS) {
        idleMs += gap;
      }
      return idleMs;
    },
  };
};
