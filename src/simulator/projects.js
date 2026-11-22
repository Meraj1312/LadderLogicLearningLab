export const PROJECTS = {
  motor: { label: 'Motor Starter', storageKey: 'lltl-project-v1' },
  tank: { label: 'Water Treatment Tank', storageKey: 'lltl-project-tank-v1' }
};

export function loadSavedProject(storage, projectId, fallback) {
  const project = PROJECTS[projectId];
  if (!project) throw new RangeError(`Unknown project: ${projectId}`);
  try {
    const saved = JSON.parse(storage.getItem(project.storageKey));
    if (saved && typeof saved === 'object' && Array.isArray(saved.rungs)) return saved;
  } catch {}
  return structuredClone(fallback);
}

export function saveProject(storage, projectId, circuit) {
  const project = PROJECTS[projectId];
  if (!project) throw new RangeError(`Unknown project: ${projectId}`);
  storage.setItem(project.storageKey, JSON.stringify(circuit));
}
