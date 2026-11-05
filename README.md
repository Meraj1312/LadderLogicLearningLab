# Ladder Logic Tutor Lab

An offline-first interactive ladder logic teaching app with four work areas: Learn, Playground, Component Library and Challenges. The simulator is a pure, deterministic JavaScript module with no `eval` and no network dependency.

## Run locally

Requires Node.js 24+ and Python 3 (no npm dependency installation is needed).

```sh
npm run dev
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). The server only serves local static files and binds to loopback. Project and challenge progress stay in browser local storage. Use the Playground's Export/Import controls to back up a circuit.

## Test the simulator

```sh
npm test
```

Tests use Node's built-in runner and cover contacts, series and parallel paths, scan ordering, OTE/OTL/OTU state, edges, TON/TOF/TP/RTO, CTU/CTD/RES, timer status contacts, diagnostics, deterministic time and immutability.

## Project notes

- Reference research: [`research/reference/PLC_FIDDLE_FINDINGS.md`](research/reference/PLC_FIDDLE_FINDINGS.md)
- Code School course inventory: [`research/reference/COURSE_CATALOG.md`](research/reference/COURSE_CATALOG.md)
- Ladder Logic fundamentals and component behavior: [`knowledge/`](knowledge/)
- Scan contract and vendor distinctions: [`knowledge/scan-cycle.md`](knowledge/scan-cycle.md)
- Architecture decisions: [`architecture/`](architecture/)
- Live Lesson 0 findings: [`docs/CODE_SCHOOL_ANALYSIS.md`](docs/CODE_SCHOOL_ANALYSIS.md)

PLC-specific scan ordering, retentive behavior and timer details vary. The lab's deterministic semantics are a documented teaching model, not a vendor PLC emulator.
