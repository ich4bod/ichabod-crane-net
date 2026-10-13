(() => {
  const saved = document.getElementById('range-saved');
  const version = document.getElementById('range-version');
  const ifRange = document.getElementById('range-if-range');
  const ignoreRange = document.getElementById('range-ignore');
  if (!saved || !version || !ifRange || !ignoreRange) return;

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
    const serverIgnoresRange = ignoreRange.checked;
    const fullResponse = serverIgnoresRange || failedCondition;
    const body = fullResponse ? currentFile : currentFile.slice(n);
    outputs.currentFile.textContent = currentFile;
    outputs.joinNote.textContent = serverIgnoresRange
      ? 'The server ignored the range; the complete file replaces the saved prefix.'
      : failedCondition
        ? 'The new complete file replaces the saved prefix.'
        : version.value === 'v1'
        ? 'The bytes join the original file.'
        : 'This joins bytes from two different files.';
    outputs.prefix.textContent = prefix;
    outputs.request.textContent = `Range: bytes=${n}-`;
    outputs.validator.textContent = ifRange.checked ? 'If-Range: "v1"' : 'If-Range: not sent.';
    outputs.status.textContent = fullResponse ? '200 OK' : '206 Partial Content';
    outputs.contentRange.textContent = fullResponse
      ? 'Content-Range: not sent for this full response.'
      : `Content-Range: bytes ${n}-9/10`;
    outputs.body.textContent = body;
    outputs.result.textContent = fullResponse ? currentFile : prefix + body;
  };

  saved.addEventListener('change', render);
  saved.addEventListener('input', render);
  version.addEventListener('change', render);
  version.addEventListener('input', render);
  ifRange.addEventListener('change', render);
  ifRange.addEventListener('input', render);
  ignoreRange.addEventListener('change', render);
  ignoreRange.addEventListener('input', render);
  render();

  const endOffset = document.getElementById('range-end-offset');
  if (endOffset) {
    const renderEnd = () => {
      const atEnd = endOffset.value === '10';
      document.getElementById('range-end-request').textContent = atEnd
        ? 'Range: bytes=10-'
        : 'Range: bytes=0-';
      document.getElementById('range-end-status').textContent = atEnd
        ? '416 Range Not Satisfiable'
        : '206 Partial Content';
      document.getElementById('range-end-content').textContent = atEnd
        ? 'Content-Range: bytes */10'
        : 'Content-Range: bytes 0-9/10';
      document.getElementById('range-end-body').textContent = atEnd
        ? 'No representation bytes.'
        : 'ABCDEFGHIJ';
    };

    endOffset.addEventListener('change', renderEnd);
    renderEnd();
  }
})();
