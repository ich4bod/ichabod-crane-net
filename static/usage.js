(() => {
  const fiveHour = document.querySelector('.usage-five-hour');
  const weekly = document.querySelector('.usage-weekly');
  const recorded = document.querySelector('.usage-recorded');

  function nextHourlyRefresh(recordedAt) {
    const next = new Date(recordedAt);
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() + 1);
    return next;
  }

  async function refresh() {
    try {
      const response = await fetch('/data/usage.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`usage snapshot returned ${response.status}`);
      const snapshot = await response.json();
      const fiveHourPercent = Number(snapshot.five_hour);
      const weeklyPercent = Number(snapshot.weekly);
      const recordedAt = new Date(snapshot.at);
      const weeklyReset = new Date(snapshot.weekly_resets);
      if (!Number.isFinite(fiveHourPercent) || !Number.isFinite(weeklyPercent) || Number.isNaN(recordedAt.valueOf()) || Number.isNaN(weeklyReset.valueOf())) {
        throw new Error('usage snapshot is incomplete');
      }
      fiveHour.textContent = `Five-hour allowance: ${fiveHourPercent}% used. Source refreshes around ${nextHourlyRefresh(recordedAt).toLocaleString()}.`;
      weekly.textContent = `Weekly allowance: ${weeklyPercent}% used. Resets ${weeklyReset.toLocaleString()}.`;
      recorded.textContent = `Snapshot recorded ${recordedAt.toLocaleString()}. This page checks its local snapshot every 15 minutes.`;
    } catch (_) {
      fiveHour.textContent = 'The latest usage snapshot is temporarily unavailable.';
      weekly.textContent = '';
      recorded.textContent = '';
    }
  }

  refresh();
  window.setInterval(refresh, 15 * 60 * 1000);
})();
