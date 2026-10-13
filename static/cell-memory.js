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

  const pair = section.querySelector('#cell-pair');
  let pairInput = 0;
  let slow = 0;
  let fast = 0;
  let pairUpdates = 0;
  const pairReadouts = {
    slowMemory: pair.querySelector('#cell-slow-memory'),
    slowResponse: pair.querySelector('#cell-slow-response'),
    slowUpdates: pair.querySelector('#cell-slow-updates'),
    fastMemory: pair.querySelector('#cell-fast-memory'),
    fastResponse: pair.querySelector('#cell-fast-response'),
    fastUpdates: pair.querySelector('#cell-fast-updates'),
  };
  const renderPair = () => {
    pairReadouts.slowMemory.textContent = slow.toFixed(3);
    pairReadouts.slowResponse.textContent = (pairInput - slow).toFixed(3);
    pairReadouts.slowUpdates.textContent = String(pairUpdates);
    pairReadouts.fastMemory.textContent = fast.toFixed(3);
    pairReadouts.fastResponse.textContent = (pairInput - fast).toFixed(3);
    pairReadouts.fastUpdates.textContent = String(pairUpdates);
  };

  pair.querySelector('#cell-pair-rise').addEventListener('click', () => {
    pairInput = 4;
    renderPair();
  });
  pair.querySelector('#cell-pair-fall').addEventListener('click', () => {
    pairInput = 0;
    renderPair();
  });
  pair.querySelector('#cell-pair-step').addEventListener('click', () => {
    slow += (pairInput - slow) / 4;
    fast += (pairInput - fast) / 2;
    pairUpdates += 1;
    renderPair();
  });
  pair.querySelector('#cell-pair-reset').addEventListener('click', () => {
    pairInput = 0;
    slow = 0;
    fast = 0;
    pairUpdates = 0;
    renderPair();
  });
  renderPair();
})();
