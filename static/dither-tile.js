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

  const render = () => {
    const n = Number(input.value);
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
      const rank = Number(rect.dataset.rank);
      rect.setAttribute('fill', g >= (rank + 0.5) / 16 ? '#ffffff' : '#000000');
    });
    field.querySelectorAll('rect').forEach((rect) => {
      const rank = Number(rect.dataset.rank);
      rect.setAttribute('fill', g >= (rank + 0.5) / 16 ? '#ffffff' : '#000000');
    });

    cutoffCount.textContent = `Plain cutoff: ${cutoffWhite ? 16 : 0} of 16 pixels are white.`;
    count.textContent = `${n} of 16 pixels are white. The encoded average is ${encoded}.`;
  };

  input.addEventListener('input', render);
  render();
})();
