/** The visualization layer reads these values but never changes simulator state. */
export function instructionState(trace, rungId, elementId) {
  return trace.find(item => item.rungId === rungId && item.elementId === elementId) ?? null;
}

export function wireSegmentEnergized(trace, rungId, elementId, phase) {
  const state = instructionState(trace, rungId, elementId);
  return Boolean(phase === 'input' ? state?.inputPower : state?.outputPower);
}

export function componentVisualState(trace, tags, rungId, elementId, type, tag, traceId = elementId) {
  const state = instructionState(trace, rungId, traceId);
  return {
    evaluated: Boolean(state),
    condition: state?.condition ?? null,
    inputPower: Boolean(state?.inputPower),
    outputPower: Boolean(state?.outputPower),
    outputValue: state?.outputValue ?? tags[tag],
    energized: type === 'coil' ? Boolean(state?.outputValue ?? tags[tag]) : Boolean(state?.outputPower),
    timerPhase: state?.timerPhase ?? null,
    elapsedMs: state?.elapsedMs ?? null,
    presetMs: state?.presetMs ?? null,
    summary: state?.summary ?? state?.detail ?? '',
    detail: state?.detail ?? 'Not evaluated',
  };
}

/** One input-side and one output-side wire segment for each evaluated instruction. */
export function energizedFlowSegments(trace) {
  return trace.flatMap(state => [
    ...(state.inputPower ? [{ rungId: state.rungId, elementId: state.elementId, phase: 'input' }] : []),
    ...(state.outputPower ? [{ rungId: state.rungId, elementId: state.elementId, phase: 'output' }] : []),
  ]);
}
