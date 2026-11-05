# Architecture decisions

## ADR 001: Keep simulation independent of UI

**Decision:** A pure TypeScript scan function accepts a circuit, runtime memory, input snapshot and duration, and returns a new state and ordered trace.

**Reason:** Deterministic replay and focused automated tests; React rendering cannot affect PLC semantics.

## ADR 002: Explicit and documented simulator semantics

**Decision:** Use the scan contract in `knowledge/scan-cycle.md`, with top-to-bottom rung ordering, left-to-right instruction evaluation, immediate working-map writes, and later write wins plus a multiple-writer diagnostic.

**Reason:** Vendor PLC semantics vary. A named educational model is more honest and testable than implying universal behavior.

## ADR 003: No JavaScript evaluation

**Decision:** Represent logic as typed data and dispatch a closed set of instruction types. Validate operands and bounds; never use `eval` or dynamically compiled source.

## ADR 004: Local-first persistence

**Decision:** Save versioned project documents and progress to local storage. Provide JSON import/export; no account or network dependency.

## ADR 005: Behavior-based assessment

**Decision:** Challenge checks run a set of deterministic action sequences and compare specified observations, not the exact shape of the learner's ladder.

## ADR 006: Teach concepts before assembly

**Decision:** Learn view pairs a compact explanation/truth table with animated trace and then guided practice; challenge view uses progressive hints.

## ADR 007: Native browser modules under restricted network

**Decision:** Ship dependency-free JavaScript modules and Node built-in tests rather than an un-installable React/Vite scaffold.

**Context:** `npm install` failed because the configured sandbox cannot resolve npm registry DNS (`ENOTFOUND`), and no React/Vite/TypeScript toolchain is preinstalled or cached. The user requires a locally working app; this constraint makes an unbuilt React scaffold nonfunctional here.

**Tradeoff:** The preferred React/TypeScript stack is deferred. Native modules preserve offline operation and the simulator remains isolated, deterministic, and independently tested.
