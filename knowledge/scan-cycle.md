# Scan cycle and execution model

## Established PLC principles

Many PLCs execute cyclic programs repeatedly. Siemens S7 documentation describes input process-image update, program execution in order, and output image transfer; some direct I/O accesses and interrupts alter the simple picture. Rockwell controllers also have family-specific execution models. Treat scan behavior as platform-specific, not a universal exact sequence. Siemens source: [S7-1200 scan cycle](https://docs.tia.siemens.cloud/r/simatic_s7_1200_manual_collection_enus_20/plc-concepts/execution-of-the-user-program/processing-the-scan-cycle-in-run-mode), [S7-300/400 process images](https://docs.tia.siemens.cloud/r/en-us/v20/functional-description-of-s7-300/400-cpus-s7-300-s7-400/addressing-s7-300-s7-400/process-images-input-and-output-memory-area-s7-300-s7-400).

## Tutor Lab deterministic scan contract (design decision)

1. Tags listed in `inputTags` are external learner-controlled values. At scan start, snapshot them so they do not change midway through a scan. If a project omits that list, tags written by program instructions are treated as outputs and other tags as inputs.
2. Begin with the prior output image and persistent internal state (timer/counter state, edge memories). Set/reset coils retain their output tag through that prior value. This lets a seal-in contact read the previous scan's OTE value before the coil writes its new result.
3. Evaluate rungs top-to-bottom, paths left-to-right. Parallel branch paths OR together; each path's contacts AND together.
4. An instruction reads the current working tag map at its point in the scan. OTE writes its rung result immediately, so a later rung may see that write; a prior rung cannot see a later write until the next scan. Timer and counter blocks preserve rung continuity and publish Q/ACC/PRE tags for contacts/instructions to read.
5. OTL/OTU write only when their rung is true; otherwise they retain the working value. For conflicting writes, the later instruction in deterministic rung/instruction order wins, while diagnostics flag multiple writers.
6. Stateful instructions receive explicit elapsed scan time (`dtMs`) and have stable instance IDs. Edge instructions compare current rung continuity against their previous-scan memory.
7. After all rungs, commit working values and state as one immutable scan result. Append execution trace and changed tags to history.

Paused mode runs no scans. Single-scan executes exactly one pass with caller-supplied virtual time. Real-time mode uses fixed simulation steps and a bounded accumulator; wall-clock drift cannot change the result of repeated single-step inputs. Reset restores the project-defined initial volatile state; persistent user preferences remain local.

This is an educational runtime contract, not a claim that any particular vendor PLC uses these precise write and image semantics.

A timer or counter block is modeled as an output instruction: it consumes current rung continuity and publishes status tags while leaving the rung's continuity unchanged. A later NO/NC contact reads its `.Q` tag. This makes status and control flow explicit and avoids treating a function block itself as an ordinary contact.
