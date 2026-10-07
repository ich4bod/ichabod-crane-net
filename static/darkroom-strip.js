(() => {
  const strip = document.getElementById('darkroom-strip');
  if (!strip) return;

  const baseSelect = strip.querySelector('#strip-base');
  const stepSelect = strip.querySelector('#strip-step');
  const list = strip.querySelector('#target-strip');
  const workingList = strip.querySelector('#working-strip');
  const stageText = strip.querySelector('#strip-stage');
  const exposeButton = strip.querySelector('#strip-expose');
  const clearButton = strip.querySelector('#strip-clear');
  const bandSelect = strip.querySelector('#strip-band');
  const burnButton = strip.querySelector('#strip-burn');
  const dodgeButton = strip.querySelector('#strip-dodge');
  const totals = [0, 0, 0, 0, 0];
  let stage = 0;
  const render = () => {
    const base = Number(baseSelect.value);
    const step = Number(stepSelect.value);
    const targets = Array.from({ length: 5 }, (_, index) => base * 2 ** (index * step));
    const maximum = targets[4];
    list.querySelectorAll('li[data-band]').forEach((item, index) => {
      const seconds = targets[index];
      item.querySelector('span').textContent = `Band ${index + 1}: ${seconds.toFixed(2)} seconds.`;
      const meter = item.querySelector('meter');
      meter.value = seconds;
      meter.max = maximum;
    });
    workingList.querySelectorAll('li[data-band]').forEach((item, index) => {
      const seconds = totals[index];
      item.querySelector('span').textContent = `Band ${index + 1}: ${seconds.toFixed(2)} seconds.`;
      const meter = item.querySelector('meter');
      meter.value = seconds;
      meter.max = Math.max(targets[4], ...totals);
      item.dataset.covered = String(index < stage);
    });
    if (stage < 5) {
      const addition = targets[stage] - (stage ? targets[stage - 1] : 0);
      stageText.textContent = `Next: add ${addition.toFixed(2)} seconds to bands ${stage + 1}–5.`;
    } else {
      stageText.textContent = 'All five target exposures have been added.';
    }
    exposeButton.disabled = stage === 5;
    clearButton.disabled = stage === 0 && totals.every(seconds => seconds === 0);
  };
  const clear = () => {
    totals.fill(0);
    stage = 0;
    render();
  };
  const resetForSpacingChange = () => {
    clear();
  };

  baseSelect.addEventListener('change', resetForSpacingChange);
  stepSelect.addEventListener('change', resetForSpacingChange);
  exposeButton.addEventListener('click', () => {
    if (stage >= 5) return;
    const base = Number(baseSelect.value);
    const step = Number(stepSelect.value);
    const targets = Array.from({ length: 5 }, (_, index) => base * 2 ** (index * step));
    const addition = targets[stage] - (stage ? targets[stage - 1] : 0);
    for (let index = stage; index < 5; index += 1) totals[index] += addition;
    stage += 1;
    render();
  });
  clearButton.addEventListener('click', clear);
  burnButton.addEventListener('click', () => {
    const selectedBand = Number(bandSelect.value);
    totals[selectedBand] += Number(baseSelect.value);
    render();
  });
  dodgeButton.addEventListener('click', () => {
    const selectedBand = Number(bandSelect.value);
    for (let index = 0; index < totals.length; index += 1) {
      if (index !== selectedBand) totals[index] += Number(baseSelect.value);
    }
    render();
  });
  render();
})();
