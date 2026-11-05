# Application architecture

## Delivery model

The app uses dependency-free browser ES modules, semantic HTML, CSS and SVG. Serve the project root on loopback; no build step, API key, CDN, account, or server-side application is required. The simulator and UI are separate modules. Local storage holds the project and challenge completion; JSON import/export supports backups.

The requested React, TypeScript and Vite toolchain was unavailable in this managed environment: npm registry DNS failed with `ENOTFOUND`, and the packages were not installed or cached. We chose an immediately runnable offline implementation instead of leaving a scaffold that cannot build here. See ADR 007.

## Layers

- `src/content/catalog.js`: original lesson, component and challenge content.
- `src/simulator/scan.js`: pure scan interpreter and runtime memory.
- `src/app.js`: section navigation, SVG rendering, editor controls, persistence and challenge execution.
- `src/ui/styles.css`: responsive industrial training visual system, dark/light themes, reduced motion.
- `src/simulator/scan.test.js`: isolated engine tests with Node's built-in test runner.

## Circuit and runtime data

Circuits are JSON objects with named tags, optional `inputTags`, ordered rungs, and ordered instruction elements. Branches hold parallel instruction paths. Runtime memory is separate from the circuit document and contains timers, counters, edge histories and the prior tag/output image. There is no executable source string and no `eval`.

The scan engine accepts a circuit, prior runtime memory, and explicit milliseconds; it returns tag values, new memory, an ordered trace and diagnostics. UI code calls it and paints the returned state. A top-to-bottom trace explains why each symbol conducts, writes, holds or advances.

## Playground features

The editor has SVG rails, contacts, coils, branches and stateful blocks; click or drag a library item onto a rung. Select an instruction to edit its tag, mode or preset. Add typed Boolean/numeric tags. Run uses fixed 100 ms steps; Pause freezes; Stop halts; Reset clears runtime/tag states while preserving the circuit; Single Scan advances one 100 ms cycle. The monitor toggles input tags, shows output and state fields, and lists recent scan history. Energized wires and symbols receive green state, with text labels carrying the same information.

## Boundaries

The editor draws a compact, linear rung and parallel alternatives, not a full IEC graphical authoring surface. Branch paths support series contacts, tag assignment, and adding/removing path contacts; the first editor keeps branch structure to a practical two-path form. Arithmetic, comparisons, timers and counters are editable structured instructions. The simulator has a named educational execution contract documented in `knowledge/scan-cycle.md`; it is not an emulation of a specific PLC brand.
