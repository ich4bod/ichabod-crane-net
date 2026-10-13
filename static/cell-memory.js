(() => {
  const section = document.getElementById('cell-model');
  if (!section) return;

  let s = 0;
  let m = 0;
  let n = 0;
  const input = section.querySelector('#cell-input');
  const current = section.querySelector('#cell-current');
  const memory = section.querySelector('#cell-memory');
  const response = section.querySelector('#cell-response');
  const updates = section.querySelector('#cell-updates');
  const memoryBar = section.querySelector('#cell-memory-bar');
  const responseDot = section.querySelector('#cell-response-dot');

  const render = () => {
    const difference = s - m;
    current.textContent = String(s);
    memory.textContent = m.toFixed(3);
    response.textContent = difference.toFixed(3);
    updates.textContent = String(n);
    memoryBar.setAttribute('width', String(80 * m));
    responseDot.setAttribute('cx', String(160 + 40 * difference));
  };

  input.addEventListener('input', () => {
    s = Number(input.value);
    render();
  });
  section.querySelector('#cell-step').addEventListener('click', () => {
    m += (s - m) / 4;
    n += 1;
    render();
  });
  section.querySelector('#cell-reset').addEventListener('click', () => {
    s = 0;
    m = 0;
    n = 0;
    input.value = '0';
    render();
  });

  render();
})();
