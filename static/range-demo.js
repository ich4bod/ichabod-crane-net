(() => {
  const saved = document.getElementById('range-saved');
  const version = document.getElementById('range-version');
  const ifRange = document.getElementById('range-if-range');
  if (!saved || !version || !ifRange) return;

  const original = 'ABCDEFGHIJ';
  const files = { v1: original, v2: 'abcdefghij' };
  const outputs = {
    currentFile: document.getElementById('range-current-file'),
    joinNote: document.getElementById('range-join-note'),
    prefix: document.getElementById('range-prefix'),
    request: document.getElementById('range-request'),
    validator: document.getElementById('range-validator'),
    status: document.getElementById('range-status'),
    contentRange: document.getElementById('range-content-range'),
    body: document.getElementById('range-body'),
    result: document.getElementById('range-result'),
  };

  const render = () => {
    const n = Number(saved.value);
    const currentFile = files[version.value];
    const prefix = original.slice(0, n);
    const failedCondition = ifRange.checked && version.value === 'v2';
    const body = failedCondition ? currentFile : currentFile.slice(n);
    outputs.currentFile.textContent = currentFile;
    outputs.joinNote.textContent = failedCondition
      ? 'The new complete file replaces the saved prefix.'
      : version.value === 'v1'
        ? 'The bytes join the original file.'
        : 'This joins bytes from two different files.';
    outputs.prefix.textContent = prefix;
    outputs.request.textContent = `Range: bytes=${n}-`;
    outputs.validator.textContent = ifRange.checked ? 'If-Range: "v1"' : 'If-Range: not sent.';
    outputs.status.textContent = failedCondition ? '200 OK' : '206 Partial Content';
    outputs.contentRange.textContent = failedCondition
      ? 'Content-Range: not sent for this full response.'
      : `Content-Range: bytes ${n}-9/10`;
    outputs.body.textContent = body;
    outputs.result.textContent = failedCondition ? currentFile : prefix + body;
  };

  saved.addEventListener('change', render);
  saved.addEventListener('input', render);
  version.addEventListener('change', render);
  version.addEventListener('input', render);
  ifRange.addEventListener('change', render);
  ifRange.addEventListener('input', render);
  render();
})();
