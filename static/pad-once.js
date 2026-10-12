(() => {
  const instrument = document.getElementById('pad-once-instrument');
  if (!instrument) return;

  const message = instrument.querySelector('#pad-message');
  const key = instrument.querySelector('#pad-key');
  const messageValue = instrument.querySelector('#pad-message-value');
  const keyValue = instrument.querySelector('#pad-key-value');
  const sum = instrument.querySelector('#pad-sum');
  const returned = instrument.querySelector('#pad-return');
  const candidateRows = instrument.querySelector('#pad-candidate-rows');
  const letter = value => String.fromCharCode(65 + value);
  const mod = value => ((value % 26) + 26) % 26;
  const format = value => `${letter(value)} (${value})`;

  const render = () => {
    const m = Number(message.value);
    const k = Number(key.value);
    const ciphertext = mod(m + k);
    messageValue.textContent = format(m);
    keyValue.textContent = format(k);
    sum.textContent = `${format(m)} + ${format(k)} = ${format(ciphertext)}.`;
    returned.textContent = `${format(ciphertext)} − ${format(k)} returns ${format(mod(ciphertext - k))}.`;

    const rows = document.createDocumentFragment();
    for (let candidate = 0; candidate < 26; candidate += 1) {
      const row = document.createElement('tr');
      const messageCell = document.createElement('td');
      const keyCell = document.createElement('td');
      messageCell.textContent = format(candidate);
      keyCell.textContent = format(mod(ciphertext - candidate));
      row.append(messageCell, keyCell);
      rows.append(row);
    }
    candidateRows.replaceChildren(rows);
  };

  message.addEventListener('input', render);
  key.addEventListener('input', render);
  render();
})();
