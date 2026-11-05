# Ladder Logic fundamentals

Ladder logic depicts Boolean and stateful control as networks between two vertical rails. A rung's conditions form a path to an output instruction. Series conditions require every condition on a path to be true (AND); parallel branches provide alternative true paths (OR). A normally open instruction is logically true when its referenced Boolean value is true; a normally closed instruction is logically true when that value is false. These names describe instruction behavior, not necessarily the electrical construction of a field device.

An output coil writes a value from its rung's evaluated result. Set/reset (latch/unlatch) instructions instead store state until their respective set or reset condition occurs. They require attention to multiple writes and reset paths. Timers and counters also hold state across scans.

## Teach with circuit and truth table together

Start with an explicit rule, then a compact rung and exhaustive truth table. For `Output := A AND NOT B`, demonstrate all four combinations. Trace active paths in the drawing and explain why a false series condition stops continuity. Only after understanding does the learner build or modify a circuit.

## Sources and scope

These are general Boolean/algebraic descriptions; instruction names and electrical semantics differ across PLC platforms. Vendor references for scan and instruction details are linked in [`scan-cycle.md`](scan-cycle.md) and [`timers-counters.md`](timers-counters.md).
