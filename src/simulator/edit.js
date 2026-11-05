/** Insert a component into a rung without changing its identity or properties. */
export function insertRungElement(circuit, rungId, element, index) {
  const rung = circuit.rungs.find(item => item.id === rungId);
  if (!rung || !element || typeof element.id !== 'string') return false;
  if (findInstruction(rung.elements, element.id)) return false;
  const at = Math.max(0, Math.min(rung.elements.length, Math.trunc(index)));
  rung.elements.splice(at, 0, element);
  return true;
}

/** Insert a new instruction into one ordered path of a parallel branch. */
export function insertBranchElement(circuit, rungId, branchId, pathIndex, element, index) {
  const rung = circuit.rungs.find(item => item.id === rungId);
  const branch = rung && findInstruction(rung.elements, branchId);
  const path = branch?.type === 'branch' ? branch.paths[pathIndex] : null;
  if (!path || !element || typeof element.id !== 'string' || findInstruction(rung.elements, element.id)) return false;
  const at = Math.max(0, Math.min(path.length, Math.trunc(index)));
  path.splice(at, 0, element);
  return true;
}

/** Swap a selected rung one position while preserving its object and contents. */
export function moveRung(circuit, rungId, direction) {
  if (direction !== -1 && direction !== 1) return false;
  const from = circuit.rungs.findIndex(item => item.id === rungId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= circuit.rungs.length) return false;
  [circuit.rungs[from], circuit.rungs[to]] = [circuit.rungs[to], circuit.rungs[from]];
  return true;
}

/** Move a rung directly to an insertion position without replacing its data. */
export function moveRungToIndex(circuit, rungId, index) {
  const from = circuit.rungs.findIndex(item => item.id === rungId);
  if (from < 0 || !Number.isInteger(index) || index < 0 || index >= circuit.rungs.length) return false;
  if (from === index) return false;
  const [rung] = circuit.rungs.splice(from, 1);
  circuit.rungs.splice(index, 0, rung);
  return true;
}

/** Remove one rung, refusing to leave a circuit without a rung. */
export function deleteRung(circuit, rungId) {
  if (circuit.rungs.length <= 1) return null;
  const index = circuit.rungs.findIndex(item => item.id === rungId);
  if (index < 0) return null;
  return circuit.rungs.splice(index, 1)[0];
}


/** Move an existing instruction between rungs, preserving its identity and properties. */
export function moveElementBetweenRungs(circuit, sourceRungId, targetRungId, elementId, index, branchId = null, pathIndex = null) {
  if (sourceRungId === targetRungId || !Number.isInteger(index)) return false;

  const sourceRung = circuit.rungs.find(item => item.id === sourceRungId);
  const targetRung = circuit.rungs.find(item => item.id === targetRungId);
  if (!sourceRung || !targetRung) return false;

  const source = findInstructionLocation(sourceRung.elements, elementId);
  if (!source) return false;

  let targetList = targetRung.elements;

  if (branchId !== null) {
    const branch = findInstruction(targetRung.elements, branchId);
    targetList = branch?.type === 'branch' ? branch.paths[pathIndex] : null;
    if (!targetList) return false;
  }

  source.list.splice(source.list.findIndex(item => item.id === elementId), 1);
  targetList.splice(Math.max(0, Math.min(targetList.length, index)), 0, source.element);

  return true;
}

/** Move a top-level instruction while retaining the same instruction objects. */
export function moveRungElement(circuit, rungId, elementId, index) {
  const rung = circuit.rungs.find(item => item.id === rungId);
  if (!rung) return false;
  const list = findContainingList(rung.elements, elementId);
  if (!list) return false;
  const from = list.findIndex(item => item.id === elementId);
  const [element] = list.splice(from, 1);
  let to = Math.trunc(index);
  if (from < to) to -= 1;
  to = Math.max(0, Math.min(list.length, to));
  list.splice(to, 0, element);
  return from !== to;
}

function findContainingList(elements, elementId) {
  for (const item of elements) {
    if (item.id === elementId) return elements;
    if (item.type === 'branch') {
      for (const path of item.paths) {
        const found = findContainingList(path, elementId);
        if (found) return found;
      }
    }
  }
  return null;
}

function findInstructionLocation(elements, elementId) {
  for (const item of elements) {
    if (item.id === elementId) return { list: elements, element: item };
    if (item.type === 'branch') {
      for (const path of item.paths) {
        const found = findInstructionLocation(path, elementId);
        if (found) return found;
      }
    }
  }
  return null;
}

function containsList(elements, target) {
  for (const item of elements) {
    if (item.type !== 'branch') continue;
    if (item.paths.includes(target) || item.paths.some(path => containsList(path, target))) return true;
  }
  return false;
}

/** Move an existing instruction into a branch path without changing its ID or tag. */
export function moveElementToBranchPath(circuit, rungId, branchId, pathIndex, elementId, index) {
  const rung = circuit.rungs.find(item => item.id === rungId);
  if (!rung || !Number.isInteger(index)) return false;
  const branch = findInstruction(rung.elements, branchId);
  const target = branch?.type === 'branch' ? branch.paths[pathIndex] : null;
  const source = findInstructionLocation(rung.elements, elementId);
  if (!target || !source || (source.element.type === 'branch' && containsList(source.element.paths, target))) return false;

  if (source.list === target) {
    const from = source.list.findIndex(item => item.id === elementId);
    if (from === index || from + 1 === index) return false;
    const [element] = source.list.splice(from, 1);
    const at = Math.max(0, Math.min(source.list.length, index > from ? index - 1 : index));
    source.list.splice(at, 0, element);
    return true;
  }

  source.list.splice(source.list.findIndex(item => item.id === elementId), 1);
  target.splice(Math.max(0, Math.min(target.length, index)), 0, source.element);
  return true;
}

/** Move a component within one existing branch path. */
export function moveBranchElement(circuit, rungId, branchId, pathIndex, elementId, index) {
  const rung = circuit.rungs.find(item => item.id === rungId);
  if (!rung) return false;
  const branch = findInstruction(rung.elements, branchId);
  const path = branch?.type === 'branch' ? branch.paths[pathIndex] : null;
  if (!path) return false;
  const from = path.findIndex(item => item.id === elementId);
  if (from < 0) return false;
  const [element] = path.splice(from, 1);
  let to = Math.trunc(index);
  if (from < to) to -= 1;
  to = Math.max(0, Math.min(path.length, to));
  path.splice(to, 0, element);
  return from !== to;
}

function findInstruction(elements, elementId) {
  for (const item of elements) {
    if (item.id === elementId) return item;
    if (item.type === 'branch') {
      for (const path of item.paths) {
        const found = findInstruction(path, elementId);
        if (found) return found;
      }
    }
  }
  return null;
}
