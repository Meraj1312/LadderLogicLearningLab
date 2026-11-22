const PUMP1_FILL_RATE = 12;
const PUMP2_FILL_RATE = 8;
const DRAIN_RATE = 3;

/**
 * Advance the simulated tank process by one time step.
 *
 * The process model changes the water level only.
 * It does not control either pump.
 *
 * Rates are expressed as percentage points per second.
 */
export function advanceTank(
  level,
  {
    pump1 = false,
    pump2 = false,
    drainOpen = false,
    dtMs = 0
  } = {}
) {
  if (!Number.isFinite(level) || level < 0 || level > 100) {
    throw new RangeError('Tank level must be between 0 and 100.');
  }

  if (!Number.isFinite(dtMs) || dtMs < 0) {
    throw new RangeError('Elapsed time must be a non-negative number.');
  }

  let rate = 0;

  if (pump1) rate += PUMP1_FILL_RATE;
  if (pump2) rate += PUMP2_FILL_RATE;
  if (drainOpen) rate -= DRAIN_RATE;

  const nextLevel = level + rate * (dtMs / 1000);

  return Math.max(0, Math.min(100, nextLevel));
}
