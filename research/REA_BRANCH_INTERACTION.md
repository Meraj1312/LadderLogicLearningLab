# PLC Fiddle branch interaction research

## Evidence and scope

- Target: `https://www.plcfiddle.com/` (Playground route `/`), page target `0FE673B81EB71785404168B33D97C461`.
- REA: `list_browser_targets`, passive `inspect_web_page` (DOM, accessibility tree, and script source), `capture_web_screenshot`, and one controlled scenario click selecting the `Other` toolbox tab.
- Screenshot after selecting `Other`: SHA-256 `774148f535aef7edff546a3771f295f7b1fa3b2f8e8b80a32e72208a23cefeed`, viewport 1920×924. It shows the Toolbox tabs, Add Rung, a branch symbol, and a Trash drop target.
- The currently rendered ladder already contained a branch with a contact assigned to the existing `Motor` variable. That was observed existing page state; it was not created during this inspection.
- REA scenario actions advertise click/fill/press/select and other non-drag actions, but no drag action. Therefore palette-to-rung drag, branch creation by drag, and live removal/reconnection could not be exercised. The findings below separate page observation from static source behavior; no unobserved interaction is presented as runtime-confirmed.

## Observed UI

- The Playground palette has tabs `Contacts`, `Coils`, `Math`, `Compare`, `Time/Count`, and `Other`.
- Selecting `Other` reveals `Add Rung`, a branch symbol, and a `Trash` drop target.
- The ladder renders each contact/coil with a `Variable` dropdown. The accessibility tree exposes existing options `Start Button`, `Stop Button`, and `Motor` for rung elements, including the observed branch contact's variable selector. This supports reuse of an existing variable by assigning the instruction to it; the selector is for the instruction’s variable reference, separate from the tag/variable definition list.
- The screenshot shows two branch rails joined at the left and right, enclosing two horizontal paths; the observed lower path contains a normally open contact referencing `Motor`.

## Source evidence from the live page bundle

The inspected script at `https://www.plcfiddle.com/assets/index-CwdAlWL1.js` (SHA-256 `bb9a915d5d97b4d03937165f1b87e0a2e4eea4cf860e439bfaf68115e6b749f6`) contains these implementation details:

- The toolbox branch is a draggable branch instruction (`type: "branch"`) with two placeholder rung IDs. The normal branch insertion path allocates two new empty rungs and inserts a branch element whose `ladder` array references those rungs. It does not create contact or coil elements in those paths.
- A branch renders two complete nested rung editors between a left and right vertical connector. The nested rungs use the same rung/drop component as ordinary rungs, with toolbox drag disabled only for toolbox previews.
- The common rung drop operation dispatches `MOVE_ELEMENT_TO_RUNG_POSITION` using the destination rung ID and position. Thus the data model can move an existing instruction into a branch path without cloning its variable definition; toolbox templates are separately copied into new element IDs.
- Variable selection is backed by a dropdown over existing variables. A new contact instruction may have an unset `variableId`; selecting `Start Button` assigns the existing variable ID and does not create another variable record.
- Deleting a branch instruction/rung removes that element/rung and updates its membership in a branch ladder. The Trash target accepts both ladder elements and rungs.
- The evaluator recursively evaluates each branch ladder with the incoming rung power and ORs the paths. An empty nested rung returns its incoming power in the inspected reference evaluator. This is observed source behavior, not a claim that the reference treats an empty branch as safe for a learner circuit.

## Runtime interaction status and uncertainty

- Confirmed at runtime: target discovery, Playground page inspection, accessibility names/options, screenshot capture, and switching the toolbox to `Other`.
- Not runtime-confirmed: branch creation via palette drag, either path’s exact drop hit area/insertion marker, dragging an existing contact into a branch, and deletion from a branch. REA’s scenario action set has no drag step, and passive inspection does not dispatch events.
- The app implementation will use an empty path as non-conducting until it contains instructions. This follows this project’s explicit requirement to avoid an accidental always-TRUE bypass; it intentionally differs from the inspected reference evaluator’s empty-rung pass-through behavior.
