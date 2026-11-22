# Ladder Logic Learning Lab

**An interactive, browser-based environment for learning and practicing PLC ladder logic.**

Build ladder circuits, understand PLC scan behaviour, experiment with instructions, and work through practical challenges — all in one place.

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Node.js-24%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 24+">
  <img src="https://img.shields.io/badge/Testing-Node.js_Test_Runner-339933?style=for-the-badge" alt="Node.js Test Runner">
  <img src="https://img.shields.io/badge/Dependencies-None-2ea44f?style=for-the-badge" alt="No dependencies">
</p>

---

## What is this project?

Ladder Logic Learning Lab is a self-built learning environment designed to make PLC ladder logic easier to understand through hands-on practice.

Instead of only reading about contacts, coils, timers, counters, and scan cycles, you can build circuits, run them, observe their behaviour, and experiment with different logic conditions.

The simulator uses a deterministic JavaScript execution engine. It does not use `eval()` and does not require an internet connection to run locally.

## Learning areas

| Area | Description |
|---|---|
| **Learn** | Study ladder logic fundamentals and understand how individual instructions work. |
| **Playground** | Build and test your own ladder logic circuits. |
| **Component Library** | Explore available ladder logic components and their behaviour. |
| **Challenges** | Practice solving problems using ladder logic. |

## Water Treatment Tank Simulation

The project includes a water treatment tank simulation that connects ladder logic with a simple industrial process.

The simulation allows you to observe how PLC logic controls the filling process using two pump stages.

**Process behaviour:**

- The tank starts at a configurable water level.
- Pump 1 operates during the first filling stage.
- Pump 2 operates during the second filling stage.
- Level thresholds control when each stage starts and stops.
- The simulation shows how ladder logic decisions affect the process.

This provides a practical way to understand the relationship between PLC logic, outputs, and process behaviour.

## Simulator capabilities

- Normally Open (NO) and Normally Closed (NC) contacts
- Output Energize (OTE)
- Output Latch (OTL) and Output Unlatch (OTU)
- Series and parallel logic paths
- Rising and falling edge instructions
- Timers: TON, TOF, TP, and RTO
- Counters: CTU, CTD, and RES
- Timer status contacts
- Deterministic scan execution
- Runtime diagnostics
- Project saving and loading
- Circuit export and import

## Getting started

### Requirements

- Node.js 24 or newer
- Python 3

No npm package installation is required.

### Run locally

Clone the repository:

```bash
git clone https://github.com/Meraj1312/LadderLogicLearningLab.git
```

Navigate into the project:

```bash
cd LadderLogicLearningLab
```

Start the local server:

```bash
npm run dev
```

Open the application:

```text
http://127.0.0.1:4173
```

The development server binds to the loopback interface, so it is accessible locally.

## Running tests

The project uses Node.js's built-in test runner.

Run:

```bash
npm test
```

The test suite covers:

- Contact evaluation and logic paths
- Series and parallel circuits
- PLC scan ordering
- OTE, OTL, and OTU behaviour
- Edge detection
- Timer and counter instructions
- Runtime diagnostics
- Project handling
- Water treatment tank simulation
- Application smoke tests

## Project architecture

The simulator is built using vanilla JavaScript, HTML, and CSS.

The execution engine is separated from the user interface to keep PLC logic predictable and testable.

```text
LadderLogicLearningLab/
│
├── architecture/
│   ├── decisions.md
│   └── overview.md
│
├── docs/
│   └── CODE_SCHOOL_ANALYSIS.md
│
├── knowledge/
│   ├── challenges.md
│   ├── components.md
│   ├── curriculum.md
│   ├── fundamentals.md
│   ├── scan-cycle.md
│   └── timers-counters.md
│
├── research/
│   ├── REA_BRANCH_INTERACTION.md
│   └── reference/
│       ├── COURSE_CATALOG.md
│       └── PLC_FIDDLE_FINDINGS.md
│
├── src/
│   ├── content/
│   │   └── catalog.js
│   │
│   ├── simulator/
│   │   ├── edit.js
│   │   ├── edit.test.js
│   │   ├── flow.js
│   │   ├── flow.test.js
│   │   ├── process.js
│   │   ├── process.test.js
│   │   ├── projects.js
│   │   ├── projects.test.js
│   │   ├── scan.js
│   │   ├── scan.test.js
│   │   └── tank.test.js
│   │
│   ├── ui/
│   │   └── styles.css
│   │
│   ├── app.js
│   └── app-smoke.test.js
│
├── index.html
├── package.json
└── README.md
```

*The tree above highlights the main project areas; some test and supporting files are grouped for readability.*

## Important note

This project is an educational ladder logic simulator, not a vendor-specific PLC emulator.

PLC scan ordering, retentive behaviour, timer implementation, and instruction semantics can vary between manufacturers. This lab uses documented, deterministic teaching semantics to help learners understand the underlying concepts.

It is not intended to control physical industrial equipment.

## Learning references

The project also contains supporting research and technical notes:

- [PLC Fiddle Reference Findings](research/reference/PLC_FIDDLE_FINDINGS.md)
- [Code School Course Catalog](research/reference/COURSE_CATALOG.md)
- [Ladder Logic Knowledge Base](knowledge/)
- [Scan Cycle Documentation](knowledge/scan-cycle.md)
- [Code School Analysis](docs/CODE_SCHOOL_ANALYSIS.md)
- [Architecture Decisions](architecture/)

---

<p align="center">
  <b>Built for learning, experimentation, and understanding PLC ladder logic.</b>
</p>