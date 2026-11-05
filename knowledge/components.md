# Component reference

| Component | Symbol / behavior | Configuration and teaching notes |
|---|---|---|
| Normally open (NO) contact | `—| |—`; true if referenced BOOL is true | Variable tag. A logic instruction, not a promise about physical normally-open wiring. |
| Normally closed (NC) contact | `—|/|—`; true if referenced BOOL is false | Variable tag. Emphasize instruction polarity separately from field device wiring. |
| Output coil (OTE) | `—( )—`; writes rung result | Variable tag; later writes/rungs can change the tag under our sequential rung rule. |
| Set coil (OTL) | `—(L)—`; sets tag true when rung true | Retains state when rung false; requires a reset path. |
| Reset coil (OTU) | `—(U)—`; sets tag false when rung true | Retains state otherwise. Define deterministic conflict policy where both instructions act in one scan. |
| Rising edge | one-scan pulse on false-to-true transition | Stores previous rung condition per instruction instance; requires unique memory identity. |
| Branch | parallel alternative paths | OR between branches; series within a branch. Support nested branches in engine representation even if initial editor only creates simple split/join shapes. |
| Comparators | `>`, `<`, `>=`, `<=`, `=`, `!=` | Numeric inputs; type errors and missing values should be visible. |
| Arithmetic / MOVE | add, subtract, multiply, divide, copy | Destination assignment. Define integer/real behavior and divide-by-zero explicitly. |
| TON | on-delay | Non-retentive elapsed duration; see timer notes. |
| TOF | off-delay | Output remains true for delay after input falls; see timer notes. |
| TP | pulse | Fixed-duration output from a rising edge; restart behavior is configured explicitly. |
| CTU / CTD | up/down counter | Edge-triggered count; preset and accumulator; done flag semantics documented. |
| RES | reset stateful instruction | Explicit target reference; resets timer/counter state according to the lab contract. |

## Design rationale

Our component library will show symbol, plain-language operation, fields, a miniature example, common errors, and linked lessons. State badges and color are supplemented by textual labels so status is not color-only.
