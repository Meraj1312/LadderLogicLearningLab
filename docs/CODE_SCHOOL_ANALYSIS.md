# PLC Fiddle Code School: Lesson 0

## Scope and evidence

This is a fresh passive inspection of the live page after the learner selected Lesson 0. No controls were clicked or modified for this lesson inspection. Browser target: `B929BB97C6BC06D70771092E2DDB5E1A`, `https://www.plcfiddle.com/code-school`, Chromium 156. REA evidence: page inspection `ev_2aac6d867470714d1975f87dc30cdca3b36223eb20eb26c22677acf5c548b705`; browser target list `ev_ea758483fa844bfdae734d4c5e0568749998753f63d2c2d73e9e64a86deb0197`.

The lesson-specific facts below are live DOM/accessibility observations. Evaluation and progression behavior is separately marked as captured-bundle evidence because this passive inspection did not activate Check.

## Lesson facts

### Exact title and instructions

The selected course is **Boolean Logic Basics**, lesson selector **Lesson 0**. The exact visible lesson text from the accessibility tree reads:

> Welcome to the Boolean Logic Basics course. Now that you know the basics of using PLC Fiddle, you can start learning ladder logic programming. After you completing this course you will have a solid foundation and you'll be able to start creating your own ladder logic programs! Let's start by taking a closer look at one of the programs from the introductory course.
>
> Try toggling the value of the tag 'Input' and watch what happens to the 'Output' tag. Now try toggling the value of the 'Output' tag. You'll find that shortly after you change the value of the 'Output' tag it will automatically changed back. Do you know why this is?
>
> Make sure the 'Input' tag is ON, and then press the 'Check' button to go to the next lesson!

### Concept taught

This lesson demonstrates that an output assigned by a ladder output instruction is recomputed from the rung logic, rather than acting as an independent switch. With the input contact true, the output coil can energize its assigned output tag. A manually changed output tag is then overwritten by program execution. The first sentence is the concept illustrated by the observed circuit and instructions; the precise timing/scan cadence is not specified by this lesson text.

### Components in the ladder

Observed in the live ladder and variable panel:

- Boolean tag `Input` assigned to a normally open contact.
- Boolean tag `Output` assigned to an output coil.
- One rung between the left and right power rails; the contact is in series with the coil.
- Tag toggles for `Input` and `Output`.

The accessibility tree exposes the ladder's input as a selectable variable assignment and the output variable assignment as `Output`. The ladder itself is represented through custom graphics; REA's DOM node count alone does not encode its full geometry.

### Initial states

At inspection time, both `Input` and `Output` were `OFF`. The contact-to-coil path appeared unenergized. The controls included `Reset` and `Check`; there was no Run/Stop control visible in this lesson's page.

### Learner action

The prompt asks the learner to observe both tags, then leave `Input` `ON` and press `Check`. The prompt also asks the learner to try toggling `Output` and explain why its value returns automatically. This inspection did not alter either tag.

## Check, progression, and feedback

**Captured bundle evidence, not a live Check interaction:** The loaded JavaScript bundle contains test vectors for each lesson. The check routine clones the lesson variables for each vector, applies specified input values, runs the ladder evaluator and compares specified output tags. Each vector must pass. For success it presents a browser confirmation with the message “Great Job! Press OK to continue to the next lesson.”; for failure it presents “Try again..”. Confirming successful completion loads the following lesson. I did not invoke Check in this inspection, so these messages and advancement are source-derived rather than directly observed in the page.

The page's visible prompt is the lesson hint/explanation. No separate hint control was present in the observed page structure. The button labels are `Reset` and `Check`.

## DOM and accessibility evidence

REA reported 284 DOM nodes and 247 accessibility nodes for this page. Relevant accessibility nodes included:

- Five grouped lesson selectors with counts 4, 9, 8, 7 and 2, corresponding to Introduction, Boolean Logic Basics, Intro to Counters, Intro to Timers and Working with Numbers; Lesson 0 in Boolean Logic Basics was selected.
- Static text for the three lesson paragraphs shown above.
- Button names `Reset` and `Check`.
- Visible tag values `OFF` for both `Input` and `Output`.
- Variable assignment options `Input` and `Output` for the ladder graphics.

The page header navigation links to the root Playground (`/`) and Code School (`/code-school`), with Code School current. A Discord community link is also present. The lesson selector is grouped by course and lessons.

## Important UI behavior and limits

- REA inspection is passive: it did not click controls, scroll, navigate or evaluate page JavaScript.
- The DOM/AX snapshot is a point-in-time view. Dynamic tag values may update on later simulation ticks.
- The course selector contains five course groups and 30 lesson entries in total; only Lesson 0 is described here.
- Captured-bundle behavior is explicitly separated from observed behavior. A source-level check definition does not prove every branch of the UI was exercised in this session.
- No claim is made here about exact ladder execution cadence, reset semantics, or an observed success modal for Lesson 0.

## Cross-session research notes

For the broader reference investigation, see [`../research/reference/PLC_FIDDLE_FINDINGS.md`](../research/reference/PLC_FIDDLE_FINDINGS.md) and [`../research/reference/COURSE_CATALOG.md`](../research/reference/COURSE_CATALOG.md). Those files label live observations separately from captured-bundle analysis and our design choices.

### Lesson title note

In the inspected page, no separate custom heading for this individual exercise was exposed. The exact visible course name is **Boolean Logic Basics** and the selected option is **Lesson 0**. The lesson panel begins with the welcome paragraph quoted above; this is the full title information visible in the inspected UI.
