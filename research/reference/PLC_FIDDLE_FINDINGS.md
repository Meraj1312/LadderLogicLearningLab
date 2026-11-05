# PLC Fiddle reference investigation

## Method and boundaries

Research used the connected REA CDP browser provider against Chromium at `http://127.0.0.1:9222`. The live PLC Fiddle page target was `B929BB97C6BC06D70771092E2DDB5E1A`. Page inspections are passive snapshots; scenario captures were used for explicitly authorized in-page navigation and limited interactions. No accounts, purchases, external submissions or unrelated actions were performed. The app's JavaScript bundle was captured through REA and inspected as shipped reference data; no PLC Fiddle implementation or assets are copied into this project.

REA evidence IDs from this session include `ev_ea758483fa844bfdae734d4c5e0568749998753f63d2c2d73e9e64a86deb0197` (target discovery), `ev_2aac6d867470714d1975f87dc30cdca3b36223eb20eb26c22677acf5c548b705` (Boolean Basics Lesson 0 DOM and accessibility), `ev_8423d7c88f8544d0096e927d87849772d057233159514e777802a524cfc53f74` (Playground Coils category), `ev_3b78647819683f6cd7c4028b9d9facdc91bb5971a546cf4dfdef891796e0ff9e` (Contacts), `ev_848b20e77e460ee95c322c7aa33b37c7479eed8ff681fb4a59e06cb4f42d2d24` (Math), `ev_e3c80112f1eda68783b6a1f859d185383b5cd75809c26d56b67b4858a16daf60` (Compare), `ev_3e588068a5c1c53ce594845b00940f1baa1c006e50803cc38aa08b3a4a07b9ee` (Time/Count), `ev_ccda0fce03ace56772fbc4097cf4d5c3c96c957ee773c00b199bedd28372cb80` (Other), and `ev_54813f4802362e6ecea082249c4098b37c049de8276a7dae505470bd7d47d740` (captured check routine). Full inline evidence is retained by REA; these identifiers are breadcrumbs, not local exported screenshots.

Confidence labels used below:

- **Observed:** directly visible in the live page or in an interaction result.
- **Bundle-derived:** found in the delivered client bundle or its course definitions, not necessarily exercised live.
- **PLC principle:** supported by authoritative vendor documentation; particular PLC families differ.
- **Unknown:** not confirmed from available evidence.
- **Lab decision:** our behavior, not an assertion about PLC Fiddle or all PLCs.

## Code School

**Observed:** The page has a course-grouped lesson selector, prose lesson panel, ladder canvas, tag/value panel, Reset and Check buttons. Navigation exposes Playground at `/` and Code School at `/code-school`. The AX tree exposed five course groups containing 4, 9, 8, 7 and 2 lesson options (30 total).

**Observed, Lesson 0 of Boolean Logic Basics:** One NO contact (`Input`) is in series with one output coil (`Output`). Both variables were OFF. Prompt asks the learner to observe Input driving Output, try toggling Output, explain its automatic return, then leave Input ON and Check. Exact lesson text is recorded in [`../../docs/CODE_SCHOOL_ANALYSIS.md`](../../docs/CODE_SCHOOL_ANALYSIS.md).

**Observed, Playground navigation:** It initially displayed a simple Input-to-Output rung. A later visit showed a Start Button / Stop Button / Motor seal-in circuit. Because the navigation scenario reloaded the SPA as well as choosing a palette category, we cannot attribute the changed sample solely to selecting a tab. Categories visibly included Contacts, Coils, Math, Compare, Time/Count and Other. Palette controls showed NO, NC and a one-shot-looking contact; plain, L (latch) and U (unlatch) coils; Add/Subtract/Multiply/Divide/Move; six comparisons; TON/TOF/RTO, CTU/CTD/Reset; and Save URL, Save file, Load File, Add Rung and Trash. No Run, Stop, Reset or single-scan buttons were visible in the captured Playground viewport.

**Observed, timer runtime:** In the timers course's first lesson, expanding the timer showed EN, TT, Q, ACC and PRE. With Input ON and preset 3, a passive snapshot around 3.5 seconds later showed EN ON, TT OFF, Q ON, ACC approximately 3.084, PRE 3, and Output ON. This is runtime evidence of elapsed-time updating. It does not prove timer behavior on every lesson/timer type.

**Observed, tag and circuit state:** In the Playground sample the variable panel showed Start Button, Stop Button and Motor values. Its circuit has Start NO, Stop NC, Motor output coil, and a parallel Motor holding contact around Start. In the captured view all three tags were OFF. Green wire through the NC Stop when Stop is OFF was consistent with its contact polarity; this is an interpretation of visual state.

**Bundle-derived model inventory:** The shipped bundle identifies contact types `xic`, `xio`, `osr`; coil types `ote`, `otl`, `otu`; comparison types `grt`, `les`, `geq`, `leq`, `equ`, `neq`; math types `add`, `sub`, `mul`, `div`, `mov`; timer types `ton`, `tof`, `rto`; counter types `ctu`, `ctd`; plus `res` and branches. The bundle contains structured variable, rung and element data and exercises ladder evaluation against lesson test vectors. Names here are descriptive reference IDs only; the Tutor Lab has its own model.

**Bundle-derived Check behavior:** A lesson's array of test vectors sets variable states, evaluates the lesson ladder, and compares required values. All cases must pass. Failure uses a confirm-style “Try again..” message. Success (except course-ending special handling) uses “Great Job! Press OK to continue to the next lesson.” and advances on acceptance. Clicking Check on one lesson during prior work did not yield a reliable dialog/advance observation through REA scenario capture, so source evidence is not presented as a live-confirmed interaction.

## Curriculum coverage

Captured course definitions enumerate 30 lessons. Their topics and exercise goals are paraphrased in [`COURSE_CATALOG.md`](COURSE_CATALOG.md). These definitions let us map all available lessons without visiting and completing each one. Runtime behavior was sampled in Boolean and timer lessons; the remaining lesson behavior has not all been exercised individually.

## Limits

- CDP inspection only captures the current page and observation window; it cannot establish unavailable earlier network/console activity.
- A passive DOM/AX snapshot can reveal labels and text but is not a full semantic representation of custom ladder SVG/canvas geometry.
- REA scenario automation has auto-dialog handling limitations: Check outcomes were not visually observed in a stable way.
- The target's bundle is evidence about the delivered reference site only. It is not evidence of IEC/vendor equivalence and is not used as application code.
- The site was available during this investigation; availability and content can change.
