# PLC Fiddle Code School: paraphrased course map

This is a topic inventory derived from the captured PLC Fiddle bundle's embedded lesson definitions. It is not a verbatim lesson transcript. Live inspection has sampled selected lessons, not every lesson's rendered UI.

| Course | Lessons | Topics and exercise progression |
|---|---:|---|
| Introduction | 4 | Navigate tags and ladder; create Boolean tags; map a contact to a different input; finish with a simple crosswalk-style program. |
| Boolean Logic Basics | 9 | Input-to-output coil behavior; assign tags; AND in series; OR in a branch; mixed logic; NC contacts; solve compound logic by changing inputs; multiple rung ordering; add a second branch/rung. |
| Intro to Counters | 8 | Counter tag fields and accumulated count; preset/done behavior; reset; build a CTU circuit; combine two counters and compare thresholds; combine done bits with OR; reset counters from a second counter; construct a count-conditioned output. |
| Intro to Timers | 7 | TON fields and elapsed behavior; retentive timer plus reset; use timing status; alternate timing intervals; TOF delay; count timer pulses; combine timed conditions. |
| Working with Numbers | 2 | Compare numeric tag values; use high and high-high level thresholds to control pumps. |

## Coverage distinction

- **Bundle-derived:** All counts/topics above are available in course definitions; tests include input assignments and expected tags.
- **Live observed:** Boolean Logic Basics Lesson 0 and a timer Lesson 0 were inspected; Playground categories and a seal-in sample circuit were inspected.
- **Not individually verified live:** Remaining lesson text, every challenge test vector, and every lesson transition. Do not claim full UI traversal based solely on a bundle inventory.
