(() => {
  const triangle = document.getElementById('constraint-triangle');
  if (!triangle) return;

  const baseInput = triangle.querySelector('#triangle-base');
  const keepArea = triangle.querySelector('#triangle-keep');
  const shape = triangle.querySelector('#triangle-shape');
  const values = triangle.querySelector('#triangle-values');
  const reset = triangle.querySelector('#triangle-reset');
  const undo = triangle.querySelector('#triangle-undo');
  let base = 120;
  let height = 120;
  let locked = keepArea.checked;
  let lastRendered = { base, height, locked };
  const history = [];
  const historyLimit = 24;

  const snapshot = () => ({ base, height, locked });
  const sameSnapshot = (a, b) => a.base === b.base && a.height === b.height && a.locked === b.locked;
  const remember = previous => {
    if (history.length === historyLimit) history.shift();
    history.push({ ...previous });
  };
  const refresh = () => {
    const area = base * height / 2;
    shape.setAttribute('points', `${160 - base / 2},280 ${160 + base / 2},280 160,${280 - height}`);
    values.textContent = `Base: ${base} · height: ${height.toFixed(1)} · area: ${Math.round(area)}.`;
    undo.disabled = history.length === 0;
    lastRendered = snapshot();
  };

  baseInput.addEventListener('input', () => {
    const previous = lastRendered;
    base = Number(baseInput.value);
    locked = keepArea.checked;
    if (locked) height = 14400 / base;
    const current = snapshot();
    if (!sameSnapshot(previous, current)) remember(previous);
    refresh();
  });
  keepArea.addEventListener('change', () => {
    const previous = lastRendered;
    locked = keepArea.checked;
    if (locked) height = 14400 / base;
    const current = snapshot();
    if (!sameSnapshot(previous, current)) remember(previous);
    refresh();
  });
  reset.addEventListener('click', () => {
    const previous = lastRendered;
    base = 120;
    height = 120;
    locked = true;
    keepArea.checked = true;
    baseInput.value = '120';
    const current = snapshot();
    if (!sameSnapshot(previous, current)) remember(previous);
    refresh();
  });
  undo.addEventListener('click', () => {
    const previous = history.pop();
    if (!previous) return;
    base = previous.base;
    height = previous.height;
    locked = previous.locked;
    baseInput.value = String(base);
    keepArea.checked = locked;
    refresh();
  });

  refresh();
})();
