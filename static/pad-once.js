(() => {
  const instrument = document.getElementById('pad-once-instrument');
  if (!instrument) return;

  const message = instrument.querySelector('#pad-message');
  const key = instrument.querySelector('#pad-key');
  const secondMessage = instrument.querySelector('#pad-second-message');
  const changeStep = instrument.querySelector('#pad-change-step');
  const changeStepValue = instrument.querySelector('#pad-change-step-value');
  const changedCipher = instrument.querySelector('#pad-changed-cipher');
  const changedMessage = instrument.querySelector('#pad-changed-message');
  const messageValue = instrument.querySelector('#pad-message-value');
  const keyValue = instrument.querySelector('#pad-key-value');
  const secondMessageValue = instrument.querySelector('#pad-second-message-value');
  const secondSum = instrument.querySelector('#pad-second-sum');
  const cipherDifference = instrument.querySelector('#pad-cipher-difference');
  const messageDifference = instrument.querySelector('#pad-message-difference');
  const sum = instrument.querySelector('#pad-sum');
  const returned = instrument.querySelector('#pad-return');
  const candidateRows = instrument.querySelector('#pad-candidate-rows');
  const keyAssumption = instrument.querySelector('#pad-key-assumption');
  const candidateCaption = instrument.querySelector('#pad-candidate-caption');
  const assumptionNote = instrument.querySelector('#pad-assumption-note');
  const letter = value => String.fromCharCode(65 + value);
  const mod = value => ((value % 26) + 26) % 26;
  const format = value => `${letter(value)} (${value})`;

  const render = () => {
    const m = Number(message.value);
    const k = Number(key.value);
    const m2 = Number(secondMessage.value);
    const ciphertext = mod(m + k);
    const secondCiphertext = mod(m2 + k);
    const changedCiphertext = mod(ciphertext + Number(changeStep.value));
    const recoveredChangedMessage = mod(changedCiphertext - k);
    messageValue.textContent = format(m);
    keyValue.textContent = format(k);
    sum.textContent = `${format(m)} + ${format(k)} = ${format(ciphertext)}.`;
    returned.textContent = `${format(ciphertext)} − ${format(k)} returns ${format(mod(ciphertext - k))}.`;
    secondMessageValue.textContent = format(m2);
    secondSum.textContent = `${format(m2)} + ${format(k)} = ${format(secondCiphertext)}.`;
    cipherDifference.textContent = `Ciphertext difference: ${ciphertext} − ${secondCiphertext} = ${mod(ciphertext - secondCiphertext)} modulo 26.`;
    messageDifference.textContent = `Message difference: ${m} − ${m2} = ${mod(m - m2)} modulo 26.`;
    changeStepValue.textContent = changeStep.value;
    changedCipher.textContent = `Changed ciphertext: ${format(ciphertext)} + ${changeStep.value} = ${format(changedCiphertext)} modulo 26.`;
    changedMessage.textContent = `Using the same key returns ${format(recoveredChangedMessage)}, not a sender check.`;

    const restricted = keyAssumption.value === 'even';
    const rows = document.createDocumentFragment();
    for (let candidate = 0; candidate < 26; candidate += 1) {
      const matchingKey = mod(ciphertext - candidate);
      if (restricted && matchingKey % 2 !== 0) continue;
      const row = document.createElement('tr');
      const messageCell = document.createElement('td');
      const keyCell = document.createElement('td');
      messageCell.textContent = format(candidate);
      keyCell.textContent = format(matchingKey);
      row.append(messageCell, keyCell);
      rows.append(row);
    }
    candidateRows.replaceChildren(rows);
    candidateCaption.textContent = `The same ciphertext, ${restricted ? 'thirteen' : 'twenty-six'} possible originals`;
    assumptionNote.textContent = restricted
      ? 'Only even key numbers leave thirteen possible originals. This ciphertext rules out the other thirteen.'
      : 'All twenty-six equally likely key numbers leave all twenty-six originals possible.';
  };

  message.addEventListener('input', render);
  key.addEventListener('input', render);
  secondMessage.addEventListener('input', render);
  changeStep.addEventListener('input', render);
  keyAssumption.addEventListener('change', render);
  render();
})();
