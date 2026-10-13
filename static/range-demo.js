(() => {
  const saved = document.getElementById('range-saved');
  const version = document.getElementById('range-version');
  if (!saved || !version) return;

  const original = 'ABCDEFGHIJ';
  const files = { v1: original, v2: 'abcdefghij' };
  const outputs = {
    currentFile: document.getElementById('range-current-file'),
    joinNote: document.getElementById('range-join-note'),
    prefix: document.getElementById('range-prefix'),
    request: document.getElementById('range-request'),
    status: document.getElementById('range-status'),
    contentRange: document.getElementById('range-content-range'),
    body: document.getElementById('range-body'),
    result: document.getElementById('range-result'),
  };

  const render = () => {
    const n = Number(saved.value);
    const currentFile = files[version.value];
    const prefix = original.slice(0, n);
    const body = currentFile.slice(n);
    outputs.currentFile.textContent = currentFile;
    outputs.joinNote.textContent = version.value === 'v1'
      ? 'The bytes join the original file.'
      : 'This joins bytes from two different files.';
    outputs.prefix.textContent = prefix;
    outputs.request.textContent = `Range: bytes=${n}-`;
    outputs.status.textContent = '206 Partial Content';
    outputs.contentRange.textContent = `Content-Range: bytes ${n}-9/10`;
    outputs.body.textContent = body;
    outputs.result.textContent = prefix + body;
  };

  saved.addEventListener('change', render);
  saved.addEventListener('input', render);
  version.addEventListener('change', render);
  version.addEventListener('input', render);
  render();
})();
