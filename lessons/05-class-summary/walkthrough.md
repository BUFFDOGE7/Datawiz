# Walkthrough 5 · Calculate class totals and averages

## 1. Add two canvases

Below the last participant comparison canvas in `index.html`, add:

```html
<h2>Total class steps per day</h2>
<canvas id="total" aria-label="Total class steps by date" role="img"></canvas>
<h2>Mean steps per participant per day</h2>
<canvas id="mean" aria-label="Mean steps per participant by date" role="img"></canvas>
```

Both charts use the same readings. The total tells you how many steps were reported. The arithmetic mean (average) is that total divided by the number of participants who reported a step count that day.

## 2. Group the readings by date

Inside `drawCharts()`, insert this block directly below the `draw('all-minutes', ...)` call from Lesson 4. Here the map’s key is a date and its value is a list of everyone’s reported steps for that date.

```javascript
const stepsByDate = new Map();
for (const sheet of sheets) {
  for (const { date, value } of readings(sheet, 'steps_count')) {
    if (!stepsByDate.has(date)) stepsByDate.set(date, []);
    if (value !== null) stepsByDate.get(date).push(value);
  }
}
```

Follow one date through the loop:

1. The outer `for` selects a participant tab. The inner `for` takes each dated point from that participant’s `steps_count` series.
2. The first time the loop sees a date, `set(date, [])` gives it an empty list. When another tab has the same date, `has(date)` is already true and the existing list is reused.
3. `get(date).push(value)` adds one number to that list. With readings of `1200, null, 0, 600`, the stored list is `[1200, 0, 600]`. Its length is the number of participants who reported steps that day.

## 3. Plot the total and the mean

**Exercise:** For each date, add the numeric readings. Divide the total by the number of readings to get the mean. Count a recorded zero. When there are no readings, use `null` for both charts.

For example, `1200, null, 0, 600` gives **1,800 total steps** and **600 steps per reporting participant** (1,800 ÷ 3). Check one date from your workbook the same way.

<details>
<summary>Show one solution</summary>

Add this immediately after the grouping loop, still inside `drawCharts()`:

```javascript
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
```

Inside the date loop, `reduce` starts at zero and adds each number to a running total. For `[1200, 0, 600]`, that produces `1800`. Both `push` calls save a point for the same date: the first gets `1800`, the second gets `1800 / 3`. When the list is empty, both store `null`. The two `draw` calls run after the loop, once the series are complete.

</details>

The core lesson is complete when both new charts match your hand calculation. Each bonus below uses `stepsByDate` and `dates` from the core solution. If you wrote your own solution, `dates` is the sorted list of keys in `stepsByDate`.

## Bonus · Median

Add a chart for the middle reading on each date. Sort the readings numerically. For an even count, average the two middle readings. For `0, 100, 200, 900` the median is **150**, while the mean is **300**.

<details>
<summary>Show one solution</summary>

Below the mean canvas in `index.html`, add:

```html
<h2>Median steps per participant per day</h2>
<canvas id="median" aria-label="Median steps per participant by date" role="img"></canvas>
```

Inside `drawCharts()`, after the mean chart, add:

```javascript
const medians = dates.map(date => {
  const values = [...stepsByDate.get(date)].sort((a, b) => a - b);
  if (values.length === 0) return { date, value: null };

  const middle = Math.floor(values.length / 2);
  let median = values[middle];
  if (values.length % 2 === 0) median = (values[middle - 1] + values[middle]) / 2;
  return { date, value: median };
});
draw('median', 'line', 'Steps', [{ label: 'Median per participant', data: medians }]);
```

`dates.map` produces one point per day. The sort uses a copy of that day’s values. For four sorted readings, `middle` is index 2 and the two central entries are at indexes 1 and 2. For three readings, index 1 alone gives the middle value.

</details>

## Bonus · Mode

Which step count occurred most often on each date? Display all values that tie for the highest frequency. For this exercise, use **No mode** when no value repeats and **No readings** for an empty day. For `0, 0, 100, 100, 900`, report **0 and 100**.

<details>
<summary>Show one solution</summary>

Below the charts in `index.html`, add:

```html
<h2>Most frequent step counts per day</h2>
<ul id="modes"></ul>
```

Inside `drawCharts()`, after the mean chart, add:

```javascript
for (const date of dates) {
  const counts = new Map();
  for (const value of stepsByDate.get(date)) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const highest = Math.max(0, ...counts.values());
  let result = 'No readings';
  if (highest === 1) result = 'No mode';
  if (highest > 1) {
    const modes = [];
    for (const [value, frequency] of counts) {
      if (frequency === highest) modes.push(value);
    }
    result = modes.join(' and ');
  }
  const item = document.createElement('li');
  item.textContent = `${date}: ${result}`;
  document.getElementById('modes').append(item);
}
```

For each date, `counts` pairs a step count with the number of times it occurs. If the value `100` appears twice, `counts.get(100)` is `2`. The second loop picks every value tied at the highest frequency. Finally, `append(item)` adds that day’s result to the HTML list.

</details>

[Lesson plan](README.md) · [Course overview](../../README.md)
