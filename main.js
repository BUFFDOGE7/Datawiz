import Chart from 'chart.js/auto';

function readings(sheet, metric) {
  const points = sheet[metric] ?? [];
  return points
    .filter(point => point.date)
    .map(({ date, value }) => ({
      date,
      value: Number.isFinite(value) ? value : null,
    }));
}

function draw(id, type, unit, datasets) {
  new Chart(document.getElementById(id), {
    type,
    data: { datasets },
    options: {
      parsing: { xAxisKey: 'date', yAxisKey: 'value' },
      scales: { y: { beginAtZero: true, title: { display: true, text: unit } } },
    },
  });
}

function participantDatasets(sheets, metric) {
  const dates = new Set();
  const participants = sheets.map(sheet => {
    const byDate = new Map();
    for (const { date, value } of readings(sheet, metric)) {
      dates.add(date);
      byDate.set(date, value);
    }
    return { name: sheet.name, byDate };
  });

  const calendar = [...dates].sort();
  return participants.map(({ name, byDate }) => ({
    label: name,
    data: calendar.map(date => ({ date, value: byDate.get(date) ?? null })),
  }));
}

function showWidestStepsGap(sheets) {
  const byDate = new Map();
  for (const sheet of sheets) {
    for (const { date, value } of readings(sheet, 'steps_count')) {
      if (value === null) continue;
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date).push({ name: sheet.name, value });
    }
  }

  const comparisons = [...byDate.entries()]
    .filter(([, values]) => values.length >= 2)
    .map(([date, values]) => {
      const lowest = values.reduce((a, b) => a.value < b.value ? a : b);
      const highest = values.reduce((a, b) => a.value > b.value ? a : b);
      return { date, values, lowest, highest, gap: highest.value - lowest.value };
    })
    .sort((a, b) => b.gap - a.gap);

  const answer = document.querySelector('#research-answer');
  if (!comparisons.length) {
    answer.textContent = 'There are not enough numeric step counts on a shared date to calculate a gap.';
    return;
  }

  const result = comparisons[0];
  const formattedDate = new Intl.DateTimeFormat('en', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${result.date}T00:00:00Z`));
  answer.textContent = `The widest gap was on ${formattedDate}: ${result.highest.name} recorded ${result.highest.value.toLocaleString()} steps and ${result.lowest.name} recorded ${result.lowest.value.toLocaleString()}, a difference of ${result.gap.toLocaleString()} steps. ${result.values.length} participants had numeric step counts that day.`;
}

async function drawCharts() {
  const response = await fetch('/api/data');
  const sheets = await response.json();
  if (!response.ok) throw new Error(sheets.error);

  const personalSheet = sheets.find(sheet => sheet.gid === '1483321021')
    ?? sheets.find(sheet => sheet.name.trim().toLocaleLowerCase() === 'mattias raudsepp');
  if (!personalSheet) {
    throw new Error('Could not find a tab named Mattias Raudsepp in the configured workbook tabs.');
  }
  draw('steps', 'bar', 'Steps', [
    { label: personalSheet.name, data: readings(personalSheet, 'steps_count') },
  ]);
  draw('minutes', 'line', 'Minutes', [
    { label: personalSheet.name, data: readings(personalSheet, 'screen_total_min') },
  ]);
  draw('all-steps', 'line', 'Steps', participantDatasets(sheets, 'steps_count'));
  draw('all-minutes', 'line', 'Minutes', participantDatasets(sheets, 'screen_total_min'));

  const stepsByDate = new Map();
  for (const sheet of sheets) {
    for (const { date, value } of readings(sheet, 'steps_count')) {
      if (!stepsByDate.has(date)) stepsByDate.set(date, []);
      if (value !== null) stepsByDate.get(date).push(value);
    }
  }

  const dates = [...stepsByDate.keys()].sort();
  const totals = [];
  const means = [];
  for (const date of dates) {
    const values = stepsByDate.get(date);
    const sum = values.reduce((total, value) => total + value, 0);
    totals.push({ date, value: values.length ? sum : null });
    means.push({ date, value: values.length ? sum / values.length : null });
  }
  draw('total', 'bar', 'Steps', [{ label: 'Class total', data: totals }]);
  draw('mean', 'line', 'Steps', [{ label: 'Mean per participant', data: means }]);
  showWidestStepsGap(sheets);
}

drawCharts().catch(error => {
  document.querySelector('#error').textContent = error.message;
});
