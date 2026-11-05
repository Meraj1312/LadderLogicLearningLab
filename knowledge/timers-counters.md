# Timers, counters, and edges

## Timer concepts

- **TON:** When input becomes true, accumulate elapsed time; Q becomes true at the preset. When input is false, reset elapsed time and Q in our non-retentive contract.
- **TOF:** Q follows a true input immediately. When input becomes false, Q remains true while the off-delay elapses, then falls. A return to true cancels the off-delay.
- **TP:** A rising edge starts a fixed-width output pulse. The lab will ignore further rising edges while active (non-retriggerable) unless a lesson explicitly explores another policy.
- **Retentive TON (RTO):** Accumulates while enabled, holds elapsed time while disabled, and clears only on explicit reset.

IEC timer operations include TP, TON, TOF, and TONR, but details of calls, data structures, time resolution, and edge handling are vendor/version-specific. See [Siemens IEC timer operations](https://docs.tia.siemens.cloud/r/simatic_s7_1200_manual_collection_enus_20/basic-instructions/timer-operations/timer-operation-iec-timers?contentId=fjb_pdYVMvfWb5h5kvkEzw), [Siemens TON](https://docs.tia.siemens.cloud/r/en-us/v21/scl-s7-300-s7-400/timer-operations-s7-300-s7-400/iec-timers-s7-300-s7-400/ton-generate-on-delay-s7-300-s7-400), [TOF](https://docs.tia.siemens.cloud/r/en-us/v21/graph-s7-300-s7-400/graph-actions-s7-300-s7-400/timer-operations-s7-300-s7-400/tof-generate-off-delay-s7-300-s7-400), [TP](https://docs.tia.siemens.cloud/r/en-us/v20/lad-s7-1200-s7-1500/timer-operations-s7-1200-s7-1500/tp-start-pulse-timer-s7-1200-s7-1500?contentId=PqzkGb_JgymcMIsNszIijA).

Timer state is keyed by instruction instance, not just displayed tag name. Provide EN, TT, Q, ACC/ET, and PRE values to the monitor when applicable. Define behavior for PT=0, reset during timing, and floating point duration rounding; engine uses integer milliseconds and clamps elapsed time to preset.

## Counters and edge detection

CTU increments once on each false-to-true transition of its rung condition, not once per scan while the condition remains true. CTD decrements on the selected edge. A repeated count requires the rung to go false and true again. The educational counter exposes ACC, PRE, and a documented done output. In our default contract, CTU starts ACC at zero and is done at `ACC >= PRE`; CTD loads ACC from PRE at first use and is done at `ACC <= 0`. RES sets ACC to zero and leaves the edge memory intact so a held rung does not count a second time. Counter reset behavior is explicit.

Rockwell manuals describe CTU/CTD counts on false-to-true rung transitions and retained counts until reset, for the specified families. The OSR instruction produces a one-scan pulse for a rising rung edge. See [Rockwell 1747 User Manual](https://literature.rockwellautomation.com/idc/groups/literature/documents/um/1747-um021_-en-p.pdf) and [Logix 5000 General Instructions](https://literature.rockwellautomation.com/idc/groups/literature/documents/rm/1756-rm003_-en-p.pdf).

Our edge detector stores the prior rung state per instruction. Timer/counter/edge memory is reset by project reset, not by pausing. `dtMs=0` must not fabricate elapsed time or repeated edge transitions.
