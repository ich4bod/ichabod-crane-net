(() => {
  const value = document.querySelector('.usage-value');
  const recorded = document.querySelector('.usage-recorded');

  async function refresh() {
    try {
      const response = await fetch('/usage.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`usage snapshot returned ${response.status}`);
      const snapshot = await response.json();
      const percent = Number(snapshot.weekly);
      if (!Number.isFinite(percent)) throw new Error('usage snapshot has no weekly percentage');
      value.textContent = `${percent}% of the weekly OpenAI allowance used`;
      recorded.textContent = `Recorded ${new Date(snapshot.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZoneName: 'short' })}.`;
    } catch (_) {
      value.textContent = 'The latest usage snapshot is temporarily unavailable.';
      recorded.textContent = '';
    }
  }

  refresh();
  window.setInterval(refresh, 15 * 60 * 1000);
})();
