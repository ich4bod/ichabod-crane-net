(() => {
  const triangle = document.getElementById('constraint-triangle');
  if (!triangle) return;

  const baseInput = triangle.querySelector('#triangle-base');
  const heightInput = triangle.querySelector('#triangle-height');
  const keepArea = triangle.querySelector('#triangle-keep');
  const shape = triangle.querySelector('#triangle-shape');
  const rectangle = triangle.querySelector('#triangle-rectangle');
  const rectangleArea = triangle.querySelector('#triangle-rectangle-area');
  const baseRuler = triangle.querySelector('#triangle-base-ruler');
  const heightRuler = triangle.querySelector('#triangle-height-ruler');
  const baseLabel = triangle.querySelector('#triangle-base-label');
  const heightLabel = triangle.querySelector('#triangle-height-label');
  const memoryShape = triangle.querySelector('#triangle-memory-shape');
  const memoryValues = triangle.querySelector('#triangle-memory-values');
  const comparison = triangle.querySelector('#triangle-comparison');
  const rememberButton = triangle.querySelector('#triangle-remember');
  const returnButton = triangle.querySelector('#triangle-return');
  const matchAreaButton = triangle.querySelector('#triangle-match-area');
  const matchWidthButton = triangle.querySelector('#triangle-match-width');
  const forgetButton = triangle.querySelector('#triangle-forget');
  const values = triangle.querySelector('#triangle-values');
  const reset = triangle.querySelector('#triangle-reset');
  const undo = triangle.querySelector('#triangle-undo');
  const redo = triangle.querySelector('#triangle-redo');
  const widenButton = triangle.querySelector('#triangle-widen');
  const narrowButton = triangle.querySelector('#triangle-narrow');
  const proportionInput = triangle.querySelector('#triangle-proportion');
  const applyProportionButton = triangle.querySelector('#triangle-apply-proportion');
  let base = 120;
  let height = 120;
  let locked = keepArea.checked;
  let lastRendered = { base, height, locked };
  const history = [];
  const redoHistory = [];
  const historyLimit = 24;
  let kept = null;

  const snapshot = () => ({ base, height, locked });
  const sameSnapshot = (a, b) => a.base === b.base && a.height === b.height && a.locked === b.locked;
  const pushHistory = (stack, state) => {
    if (stack.length === historyLimit) stack.shift();
    stack.push({ ...state });
  };
  const remember = previous => {
    pushHistory(history, previous);
    redoHistory.length = 0;
  };
  const restore = state => {
    base = state.base;
    height = state.height;
    locked = state.locked;
    baseInput.value = String(base);
    keepArea.checked = locked;
    refresh();
  };
  const matchAreaCandidate = (state, memory, dimension) => {
    if (!memory || state.locked) return null;
    const candidate = dimension === 'base'
      ? memory.base * memory.height / state.height
      : memory.base * memory.height / state.base;
    const minimum = dimension === 'base' ? 60 : 30;
    const maximum = dimension === 'base' ? 240 : 240;
    return Number.isFinite(candidate) && candidate >= minimum && candidate <= maximum
      && (dimension !== 'base' || candidate % 10 === 0) && candidate !== state[dimension]
      ? candidate
      : null;
  };
  const proportionCandidate = (state, ratio) => {
    if (state.locked) return null;
    const candidate = state.base / ratio;
    return Number.isFinite(candidate) && candidate >= 30 && candidate <= 240 && candidate !== state.height
      ? candidate
      : null;
  };
  const refreshProportion = () => {
    applyProportionButton.disabled = proportionCandidate(snapshot(), Number(proportionInput.value)) === null;
  };
  const matchAreaHeight = (state, memory) => matchAreaCandidate(state, memory, 'height');
  const matchAreaWidth = (state, memory) => matchAreaCandidate(state, memory, 'base');
  const refreshMatchArea = () => {
    const state = snapshot();
    matchAreaButton.disabled = matchAreaHeight(state, kept) === null;
    matchWidthButton.disabled = matchAreaWidth(state, kept) === null;
  };
  const tradeCandidate = (state, factor) => {
    const candidate = { base: state.base * factor, height: state.height / factor };
    return candidate.base >= 60 && candidate.base <= 240 && candidate.base % 10 === 0
      && candidate.height >= 30 && candidate.height <= 240
      ? candidate
      : null;
  };
  const refreshTradeButtons = () => {
    const state = snapshot();
    widenButton.disabled = tradeCandidate(state, 2) === null;
    narrowButton.disabled = tradeCandidate(state, 0.5) === null;
  };
  const refreshComparison = () => {
    if (!kept) {
      comparison.textContent = 'Keep a triangle to compare dimensions.';
      return;
    }
    const baseRatio = (base / kept.base).toFixed(2);
    const heightRatio = (height / kept.height).toFixed(2);
    const areaRatio = ((base * height) / (kept.base * kept.height)).toFixed(2);
    comparison.textContent = `Compared with kept: base ×${baseRatio} · height ×${heightRatio} · area ×${areaRatio}.`;
  };
  const refresh = () => {
    const area = base * height / 2;
    shape.setAttribute('points', `${160 - base / 2},280 ${160 + base / 2},280 160,${280 - height}`);
    rectangle.setAttribute('x', String(160 - base / 2));
    rectangle.setAttribute('y', String(280 - height));
    rectangle.setAttribute('width', String(base));
    rectangle.setAttribute('height', String(height));
    rectangleArea.textContent = `Bounding rectangle: ${Math.round(base * height)} square units · triangle: ${Math.round(area)} square units.`;
    baseRuler.setAttribute('x1', String(160 - base / 2));
    baseRuler.setAttribute('x2', String(160 + base / 2));
    heightRuler.setAttribute('y2', String(280 - height));
    baseLabel.textContent = `base ${base}`;
    heightLabel.setAttribute('y', String(280 - height / 2));
    heightLabel.textContent = `height ${height.toFixed(1)}`;
    values.textContent = `Base: ${base} · height: ${height.toFixed(1)} · area: ${Math.round(area)}.`;
    heightInput.value = String(height);
    heightInput.disabled = locked;
    undo.disabled = history.length === 0;
    redo.disabled = redoHistory.length === 0;
    lastRendered = snapshot();
    refreshTradeButtons();
    refreshProportion();
    returnButton.disabled = !kept || sameSnapshot(lastRendered, kept);
    refreshMatchArea();
    refreshComparison();
  };
  const refreshMemory = () => {
    if (!kept) {
      memoryShape.setAttribute('points', '');
      memoryShape.toggleAttribute('hidden', true);
      memoryValues.textContent = 'No triangle kept.';
      forgetButton.disabled = true;
    } else {
      memoryShape.setAttribute('points', `${160 - kept.base / 2},280 ${160 + kept.base / 2},280 160,${280 - kept.height}`);
      memoryShape.toggleAttribute('hidden', false);
      memoryValues.textContent = `Kept: base ${kept.base} · height ${kept.height.toFixed(1)} · area ${Math.round(kept.base * kept.height / 2)}.`;
      forgetButton.disabled = false;
    }
    returnButton.disabled = !kept || sameSnapshot(snapshot(), kept);
    refreshMatchArea();
    refreshComparison();
  };

  rememberButton.addEventListener('click', () => {
    kept = snapshot();
    refreshMemory();
  });
  returnButton.addEventListener('click', () => {
    if (!kept || sameSnapshot(snapshot(), kept)) return;
    remember(lastRendered);
    base = kept.base;
    height = kept.height;
    locked = kept.locked;
    baseInput.value = String(base);
    keepArea.checked = locked;
    refresh();
    refreshMemory();
  });
  proportionInput.addEventListener('change', refreshProportion);
  applyProportionButton.addEventListener('click', () => {
    const candidate = proportionCandidate(snapshot(), Number(proportionInput.value));
    if (candidate === null) return;
    remember(lastRendered);
    height = candidate;
    refresh();
  });
  matchAreaButton.addEventListener('click', () => {
    const candidate = matchAreaHeight(snapshot(), kept);
    if (candidate === null) return;
    remember(lastRendered);
    height = candidate;
    refresh();
  });
  matchWidthButton.addEventListener('click', () => {
    const candidate = matchAreaWidth(snapshot(), kept);
    if (candidate === null) return;
    remember(lastRendered);
    base = candidate;
    baseInput.value = String(base);
    refresh();
  });
  forgetButton.addEventListener('click', () => {
    kept = null;
    refreshMemory();
  });
  const trade = factor => {
    const candidate = tradeCandidate(snapshot(), factor);
    if (candidate === null) return;
    remember(lastRendered);
    base = candidate.base;
    height = candidate.height;
    baseInput.value = String(base);
    keepArea.checked = locked;
    refresh();
  };
  widenButton.addEventListener('click', () => trade(2));
  narrowButton.addEventListener('click', () => trade(0.5));

  baseInput.addEventListener('input', () => {
    const previous = lastRendered;
    base = Number(baseInput.value);
    locked = keepArea.checked;
    if (locked) height = 14400 / base;
    const current = snapshot();
    if (!sameSnapshot(previous, current)) remember(previous);
    refresh();
  });
  heightInput.addEventListener('input', () => {
    const previous = lastRendered;
    height = Number(heightInput.value);
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
    pushHistory(redoHistory, snapshot());
    restore(previous);
  });
  redo.addEventListener('click', () => {
    const next = redoHistory.pop();
    if (!next) return;
    pushHistory(history, snapshot());
    restore(next);
  });

  refresh();
  refreshMemory();
})();
