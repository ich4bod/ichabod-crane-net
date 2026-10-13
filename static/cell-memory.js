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

  const paths = {
    rise: [0, 1, 2, 3, 4],
    hold: [0, 4, 4, 4, 4],
    return: [0, 4, 4, 0, 0],
  };
  const pathChoice = section.querySelector('#cell-path-choice');
  const pathUse = section.querySelector('#cell-path-use');
  const pathNext = section.querySelector('#cell-path-next');
  const pathCurrent = section.querySelector('#cell-path-current');
  const pathMemory = section.querySelector('#cell-path-memory');
  const pathResponse = section.querySelector('#cell-path-response');
  const pathUpdates = section.querySelector('#cell-path-updates');
  const pathTrace = section.querySelector('#cell-path-trace');
  const svgNamespace = 'http://www.w3.org/2000/svg';
  let activePath = null;
  let pathS = 0;
  let pathM = 0;
  let pathN = 0;
  let visited = [];

  const renderPath = () => {
    pathCurrent.textContent = activePath ? String(pathS) : '—';
    pathMemory.textContent = pathM.toFixed(3);
    pathResponse.textContent = (pathS - pathM).toFixed(3);
    pathUpdates.textContent = String(pathN);
    pathNext.disabled = !activePath || pathN >= activePath.length - 1;

    pathTrace.replaceChildren();
    if (visited.length === 0) return;
    const points = visited.map((sample, index) => `${20 + 70 * index},${180 - 40 * sample}`);
    const line = document.createElementNS(svgNamespace, 'polyline');
    line.setAttribute('points', points.join(' '));
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#efc86b');
    line.setAttribute('stroke-width', '2');
    pathTrace.append(line);
    visited.forEach((sample, index) => {
      const circle = document.createElementNS(svgNamespace, 'circle');
      circle.setAttribute('cx', String(20 + 70 * index));
      circle.setAttribute('cy', String(180 - 40 * sample));
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', '#efc86b');
      pathTrace.append(circle);
    });
  };

  pathUse.addEventListener('click', () => {
    activePath = paths[pathChoice.value].slice();
    pathS = activePath[0];
    pathM = 0;
    pathN = 0;
    visited = [pathS];
    renderPath();
  });
  pathNext.addEventListener('click', () => {
    if (!activePath || pathN >= activePath.length - 1) return;
    pathN += 1;
    pathS = activePath[pathN];
    pathM += (pathS - pathM) / 4;
    visited.push(pathS);
    renderPath();
  });
  renderPath();
})();
