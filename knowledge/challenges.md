# Challenge specifications

Challenges should evaluate behavior across multiple input sequences, not require one exact arrangement of symbols. Every check case has initial state, external input actions, virtual-time advances or scan steps, expected outputs/state, and a clear failure explanation. Show progressive hints: identify relevant tag; point to a path or edge; name a component concept. Reveal a reference solution only after learner asks or completes the activity.

Initial challenge families:

1. **One condition:** drive a lamp from one input with NO contact.
2. **Interlock:** output on when Start is true and Stop is false; enumerate all combinations.
3. **Two-hand condition:** both inputs required; then one parallel alternative.
4. **Seal-in:** start latches a motor state, stop releases it; provide stop behavior and safety note.
5. **One-shot counter:** count rising events, ignore a held input, reset at target.
6. **Delayed fan:** TON to start, immediate stop on permissive loss.
7. **Run-on fan:** TOF keeps output on after request falls.
8. **Pulse and count:** TP pulses increment a counter; reach a target.
9. **Numeric compare:** select outputs at low/high thresholds, test equality boundary.
10. **Integrated tank:** use numeric `Level`, `High` and `HighHigh` tags. Pump1 runs below `High`; Pump2 runs from `High` up to but not including `HighHigh`; both stop at and above `HighHigh`. Test below, exactly at and above each boundary.

Tests specify observable outcomes and boundary transitions. Include false-to-true sequences and held states so a level-triggered implementation cannot pass an edge-triggered challenge accidentally.
