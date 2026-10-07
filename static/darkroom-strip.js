(() => {
  const strip = document.getElementById('darkroom-strip');
  if (!strip) return;

  const baseSelect = strip.querySelector('#strip-base');
  const stepSelect = strip.querySelector('#strip-step');
  const list = strip.querySelector('#target-strip');
  const differenceList = strip.querySelector('#strip-target-differences');
  const workingList = strip.querySelector('#working-strip');
  const keptList = strip.querySelector('#kept-strip');
  const keptInfo = strip.querySelector('#strip-kept-info');
  const bandComparison = strip.querySelector('#strip-band-comparison');
  const keepButton = strip.querySelector('#strip-keep');
  const returnButton = strip.querySelector('#strip-return');
  const forgetButton = strip.querySelector('#strip-forget');
  const stageText = strip.querySelector('#strip-stage');
  const exposeButton = strip.querySelector('#strip-expose');
  const finishButton = strip.querySelector('#strip-finish');
  const clearButton = strip.querySelector('#strip-clear');
  const bandSelect = strip.querySelector('#strip-band');
  const doseSelect = strip.querySelector('#strip-dose');
  const factorSelect = strip.querySelector('#strip-factor');
  const scaleButton = strip.querySelector('#strip-scale');
  const burnButton = strip.querySelector('#strip-burn');
  const dodgeButton = strip.querySelector('#strip-dodge');
  const totals = [0, 0, 0, 0, 0];
  const past = [];
  const future = [];
  let kept = null;
  let stage = 0;
  const snapshot = () => ({ totals: [...totals], stage });
  const pushHistory = (history, state) => {
    history.push(state);
    if (history.length > 24) history.shift();
  };
  const commitChange = change => {
    const before = snapshot();
    change();
    pushHistory(past, before);
    future.length = 0;
    render();
  };
  const restore = state => {
    totals.splice(0, totals.length, ...state.totals);
    stage = state.stage;
    render();
  };
  const render = () => {
    const base = Number(baseSelect.value);
    const step = stepSelect.value;
    const targets = Array.from({ length: 5 }, (_, index) => step === 'seconds'
      ? base * (index + 1)
      : base * 2 ** (index * Number(step)));
    strip.querySelector('#strip-rule').textContent = step === 'seconds'
      ? 'Time = first exposure × (band index + 1). Equal additions of seconds are not equal stops.'
      : 'Time = first exposure × 2^(band index × stop step). Band indices start at zero.';
    const maximum = targets[4];
    const comparisonMaximum = kept
      ? Math.max(maximum, ...totals, ...kept.totals)
      : Math.max(maximum, ...totals);
    list.querySelectorAll('li[data-band]').forEach((item, index) => {
      const seconds = targets[index];
      item.querySelector('span').textContent = `Band ${index + 1}: ${seconds.toFixed(2)} seconds.`;
      const meter = item.querySelector('meter');
      meter.value = seconds;
      meter.max = maximum;
    });
    differenceList.querySelectorAll('li[data-band]').forEach((item, index) => {
      const difference = targets[index] - totals[index];
      const amount = Math.abs(difference).toFixed(2);
      const state = difference > 0 ? 'short of target' : difference < 0 ? 'beyond target' : 'at target';
      item.textContent = `Band ${index + 1}: ${amount} seconds ${state}.`;
    });
    workingList.querySelectorAll('li[data-band]').forEach((item, index) => {
      const seconds = totals[index];
      item.querySelector('span').textContent = `Band ${index + 1}: ${seconds.toFixed(2)} seconds.`;
      const meter = item.querySelector('meter');
      meter.value = seconds;
      meter.max = comparisonMaximum;
      item.dataset.covered = String(index < stage);
    });
    keptList.hidden = kept === null;
    if (kept) {
      keptInfo.textContent = kept.step === 'seconds'
        ? `Kept: first exposure ${kept.base} seconds · step equal seconds.`
        : `Kept: first exposure ${kept.base} seconds · step ${kept.step} stop.`;
      keptList.querySelectorAll('li[data-band]').forEach((item, index) => {
        const seconds = kept.totals[index];
        item.querySelector('span').textContent = `Band ${index + 1}: ${seconds.toFixed(2)} seconds.`;
        const meter = item.querySelector('meter');
        meter.value = seconds;
        meter.max = comparisonMaximum;
      });
    } else {
      keptInfo.textContent = 'No strip kept.';
    }
    if (kept === null) {
      bandComparison.textContent = 'Keep a strip to compare this band.';
    } else {
      const index = Number(bandSelect.value);
      const current = totals[index];
      const reference = kept.totals[index];
      const amounts = `Band ${index + 1}: current ${current.toFixed(2)} seconds · kept ${reference.toFixed(2)} seconds`;
      if (current === 0 || reference === 0) {
        bandComparison.textContent = `${amounts} · stop difference unavailable at zero light.`;
      } else {
        let difference = Math.log2(current / reference);
        if (Object.is(difference, -0)) difference = 0;
        bandComparison.textContent = `${amounts} · difference ${difference.toFixed(2)} stops.`;
      }
    }
    keepButton.disabled = totals.every(seconds => seconds === 0);
    scaleButton.disabled = totals.every(seconds => seconds === 0);
    returnButton.disabled = kept === null || (stage === 0 && kept.totals.every((seconds, index) => seconds === totals[index]));
    forgetButton.disabled = kept === null;
    if (stage < 5) {
      const addition = targets[stage] - (stage ? targets[stage - 1] : 0);
      stageText.textContent = `Next: add ${addition.toFixed(2)} seconds to bands ${stage + 1}–5.`;
    } else {
      stageText.textContent = 'All five target exposures have been added.';
    }
    exposeButton.disabled = stage === 5;
    finishButton.disabled = stage === 5;
    clearButton.disabled = stage === 0 && totals.every(seconds => seconds === 0);
    strip.querySelector('#strip-undo').disabled = past.length === 0;
    strip.querySelector('#strip-redo').disabled = future.length === 0;
  };
  const resetForSpacingChange = () => {
    totals.fill(0);
    stage = 0;
    past.length = 0;
    future.length = 0;
    render();
  };

  baseSelect.addEventListener('change', resetForSpacingChange);
  stepSelect.addEventListener('change', resetForSpacingChange);
  bandSelect.addEventListener('change', render);
  doseSelect.addEventListener('change', render);
  factorSelect.addEventListener('change', render);
  exposeButton.addEventListener('click', () => {
    if (stage >= 5) return;
    commitChange(() => {
      const base = Number(baseSelect.value);
      const step = stepSelect.value;
      const targets = Array.from({ length: 5 }, (_, index) => step === 'seconds'
        ? base * (index + 1)
        : base * 2 ** (index * Number(step)));
      const addition = targets[stage] - (stage ? targets[stage - 1] : 0);
      for (let index = stage; index < 5; index += 1) totals[index] += addition;
      stage += 1;
    });
  });
  finishButton.addEventListener('click', () => {
    if (stage >= 5) return;
    commitChange(() => {
      const base = Number(baseSelect.value);
      const step = stepSelect.value;
      const targets = Array.from({ length: 5 }, (_, index) => step === 'seconds'
        ? base * (index + 1)
        : base * 2 ** (index * Number(step)));
      for (let mask = stage; mask < 5; mask += 1) {
        const addition = targets[mask] - (mask ? targets[mask - 1] : 0);
        for (let index = mask; index < 5; index += 1) totals[index] += addition;
      }
      stage = 5;
    });
  });
  clearButton.addEventListener('click', () => {
    if (stage === 0 && totals.every(seconds => seconds === 0)) return;
    commitChange(() => {
      totals.fill(0);
      stage = 0;
    });
  });
  strip.querySelector('#strip-undo').addEventListener('click', () => {
    if (!past.length) return;
    pushHistory(future, snapshot());
    restore(past.pop());
  });
  strip.querySelector('#strip-redo').addEventListener('click', () => {
    if (!future.length) return;
    pushHistory(past, snapshot());
    restore(future.pop());
  });
  keepButton.addEventListener('click', () => {
    if (totals.every(seconds => seconds === 0)) return;
    kept = {
      totals: [...totals],
      base: Number(baseSelect.value),
      step: stepSelect.value,
    };
    render();
  });
  returnButton.addEventListener('click', () => {
    if (kept === null) return;
    const candidate = { totals: [...kept.totals], stage: 0 };
    if (candidate.stage === stage && candidate.totals.every((seconds, index) => seconds === totals[index])) return;
    commitChange(() => {
      totals.splice(0, totals.length, ...candidate.totals);
      stage = candidate.stage;
    });
  });
  forgetButton.addEventListener('click', () => {
    if (kept === null) return;
    kept = null;
    render();
  });
  burnButton.addEventListener('click', () => {
    commitChange(() => {
      const selectedBand = Number(bandSelect.value);
      totals[selectedBand] += Number(baseSelect.value) * Number(doseSelect.value);
    });
  });
  dodgeButton.addEventListener('click', () => {
    commitChange(() => {
      const selectedBand = Number(bandSelect.value);
      for (let index = 0; index < totals.length; index += 1) {
        if (index !== selectedBand) totals[index] += Number(baseSelect.value) * Number(doseSelect.value);
      }
    });
  });
  scaleButton.addEventListener('click', () => {
    if (totals.every(seconds => seconds === 0)) return;
    const factor = Number(factorSelect.value);
    const candidate = totals.map(seconds => seconds * factor);
    commitChange(() => {
      totals.splice(0, totals.length, ...candidate);
    });
  });
  render();
})();
