(() => {
  const triangle = document.getElementById('constraint-triangle');
  if (!triangle) return;

  const baseInput = triangle.querySelector('#triangle-base');
  const keepArea = triangle.querySelector('#triangle-keep');
  const shape = triangle.querySelector('#triangle-shape');
  const values = triangle.querySelector('#triangle-values');
  const reset = triangle.querySelector('#triangle-reset');
  let base = 120;
  let height = 120;

  const refresh = () => {
    const area = base * height / 2;
    shape.setAttribute('points', `${160 - base / 2},280 ${160 + base / 2},280 160,${280 - height}`);
    values.textContent = `Base: ${base} · height: ${height.toFixed(1)} · area: ${Math.round(area)}.`;
  };

  baseInput.addEventListener('input', () => {
    base = Number(baseInput.value);
    if (keepArea.checked) height = 14400 / base;
    refresh();
  });
  keepArea.addEventListener('change', () => {
    if (keepArea.checked) height = 14400 / base;
    refresh();
  });
  reset.addEventListener('click', () => {
    base = 120;
    height = 120;
    keepArea.checked = true;
    baseInput.value = '120';
    refresh();
  });

  refresh();
})();
