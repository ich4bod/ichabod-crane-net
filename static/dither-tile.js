(() => {
  const input = document.getElementById('dither-input');
  if (!input) return;

  const value = document.getElementById('dither-input-value');
  const swatch = document.getElementById('dither-input-swatch');
  const cutoff = document.getElementById('dither-cutoff');
  const tile = document.getElementById('dither-tile');
  const field = document.getElementById('dither-field');
  const cutoffCount = document.getElementById('dither-cutoff-count');
  const count = document.getElementById('dither-count');
  const shiftX = document.getElementById('dither-shift-x');
  const shiftY = document.getElementById('dither-shift-y');
  const shiftValue = document.getElementById('dither-shift-value');
  const ranks = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  const render = () => {
    const n = Number(input.value);
    const ox = Number(shiftX.value);
    const oy = Number(shiftY.value);
    const g = n / 16;
    const encoded = g.toFixed(4);
    const shade = Math.round(255 * n / 16);
    value.textContent = encoded;
    swatch.style.backgroundColor = `rgb(${shade}, ${shade}, ${shade})`;

    const cutoffWhite = g >= 0.5;
    cutoff.querySelectorAll('rect').forEach((rect) => {
      rect.setAttribute('fill', cutoffWhite ? '#ffffff' : '#000000');
    });
    tile.querySelectorAll('rect').forEach((rect) => {
      const x = Number(rect.getAttribute('x'));
      const y = Number(rect.getAttribute('y'));
      const rank = ranks[((y + oy) % 4) * 4 + (x + ox) % 4];
      rect.setAttribute('data-rank', rank);
      rect.setAttribute('fill', g >= (rank + 0.5) / 16 ? '#ffffff' : '#000000');
    });
    field.querySelectorAll('rect').forEach((rect) => {
      const x = Number(rect.getAttribute('x'));
      const y = Number(rect.getAttribute('y'));
      const rank = ranks[((y + oy) % 4) * 4 + (x + ox) % 4];
      rect.setAttribute('data-rank', rank);
      rect.setAttribute('fill', g >= (rank + 0.5) / 16 ? '#ffffff' : '#000000');
    });

    cutoffCount.textContent = `Plain cutoff: ${cutoffWhite ? 16 : 0} of 16 pixels are white.`;
    count.textContent = `${n} of 16 pixels are white. The encoded average is ${encoded}.`;
    shiftValue.textContent = `Threshold tile offset: ${ox} across, ${oy} down. The white count is unchanged.`;
  };

  input.addEventListener('input', render);
  shiftX.addEventListener('input', render);
  shiftY.addEventListener('input', render);
  render();
})();
