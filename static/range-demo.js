(() => {
  const saved = document.getElementById('range-saved');
  if (!saved) return;

  const original = 'ABCDEFGHIJ';
  const outputs = {
    prefix: document.getElementById('range-prefix'),
    request: document.getElementById('range-request'),
    status: document.getElementById('range-status'),
    contentRange: document.getElementById('range-content-range'),
    body: document.getElementById('range-body'),
    result: document.getElementById('range-result'),
  };

  const render = () => {
    const n = Number(saved.value);
    const prefix = original.slice(0, n);
    const body = original.slice(n);
    outputs.prefix.textContent = prefix;
    outputs.request.textContent = `Range: bytes=${n}-`;
    outputs.status.textContent = '206 Partial Content';
    outputs.contentRange.textContent = `Content-Range: bytes ${n}-9/10`;
    outputs.body.textContent = body;
    outputs.result.textContent = prefix + body;
  };

  saved.addEventListener('change', render);
  saved.addEventListener('input', render);
  render();
})();
