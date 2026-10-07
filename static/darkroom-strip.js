(() => {
  const strip = document.getElementById('darkroom-strip');
  if (!strip) return;

  const baseSelect = strip.querySelector('#strip-base');
  const stepSelect = strip.querySelector('#strip-step');
  const list = strip.querySelector('#target-strip');
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
  };

  baseSelect.addEventListener('change', render);
  stepSelect.addEventListener('change', render);
  render();
})();
