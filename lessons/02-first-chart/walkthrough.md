# Walkthrough 2 · Set up Chart.js

Keep Vite running and leave Lesson 1’s `/api/data` open in a browser tab. The root project already includes Chart.js. Create the following three files beside `package.json`.

## 1. Create `index.html`

The canvas is where Chart.js draws. The two file references load the CSS and JavaScript you’ll write next.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Class activity</title>
    <link rel="stylesheet" href="./style.css">
  </head>
  <body>
    <h1>Class activity</h1>
    <a href="/api/data">View full JSON</a>
    <h2>Daily steps</h2>
    <canvas id="steps" aria-label="Daily steps" role="img"></canvas>
    <p id="error" role="alert"></p>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

## 2. Create `style.css`

Keep the chart readable on a wide screen.

```css
body {
  max-width: 48rem;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
}
```

## 3. Fetch one sheet and check it in the browser

Create `main.js` beside `index.html`. Start with this working file:

```javascript
import Chart from 'chart.js/auto';

async function drawCharts() {
  const response = await fetch('/api/data');
  const sheets = await response.json();
  if (!response.ok) throw new Error(sheets.error);

  const first = sheets[0];
  console.log(first.name, first.steps_count);
}

drawCharts().catch(error => {
  document.querySelector('#error').textContent = error.message;
});
```

- `import` makes the installed Chart.js package available as `Chart`. You’ll use it in step 5.
- `fetch` asks your Vite server for the same URL you opened in Lesson 1. The first `await` waits for the response. The second waits for `response.json()` to read its contents as JavaScript data. `async` lets you use `await` inside this function.
- The API returns an array of tabs. `sheets[0]` selects the first tab in your configured order. `first.name` is its title and `first.steps_count` is its array of dated readings.
- The last three lines run `drawCharts()` once. If the API returns an error, `throw` passes it to `catch`, which puts the message in the HTML paragraph with `id="error"`.

Save and open Vite’s local address at `/`. Open the browser’s developer tools and select **Console**. You should see a tab name and an array. Expand one entry to find a date and a value. The canvas is still empty at this point.

## 4. Choose the readings to plot

In `main.js`, insert this function **above** `async function drawCharts()`:

```javascript
function readings(sheet, metric) {
  const points = sheet[metric] ?? [];
  return points
    .filter(point => point.date)
    .map(({ date, value }) => ({
      date,
      value: Number.isFinite(value) ? value : null,
    }));
}
```

1. With `metric` set to `'steps_count'`, `sheet[metric]` reads `sheet.steps_count`. The brackets let Lesson 3 use the same function for a different measurement. `?? []` supplies an empty array if the sheet has no such row.
2. `filter` keeps points that have a date, so each point has a position on the horizontal axis.
3. `map` creates one chart point for each remaining reading. `{ date, value }` picks those two fields out of the reading. The numeric check keeps a measured zero. A blank or text value becomes `null`, which leaves a gap in the chart.

## 5. Tell Chart.js how to draw those points

Insert this function **above** `async function drawCharts()` as well:

```javascript
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
```

`new Chart` takes a canvas and a configuration object. `id` selects the canvas you created in step 1. `type` chooses the chart shape, and `datasets` holds the series to draw. The `parsing` line tells Chart.js how to read your JSON. For a point like `{ date: '2026-11-13', value: 7777 }`, the date appears on the horizontal axis and the bar rises to 7,777. `unit` supplies the vertical axis title.

## 6. Draw the first participant’s bars

Inside `drawCharts()`, keep `const first = sheets[0];` and **replace only the `console.log(...)` line** with:

```javascript
  const steps = readings(first, 'steps_count');
  draw('steps', 'bar', 'Steps', [
    { label: first.name, data: steps },
  ]);
```

`readings` selects the values. `draw('steps', 'bar', 'Steps', …)` sends them to the canvas with `id="steps"` as bars measured in steps. The square brackets hold one dataset: `label` is the name in the legend and `data` contains its points.

Save and hover over one bar. Compare its height with the first tab’s `steps_count` for that date in **View full JSON**. Commit the three files once the values match.

[Lesson plan](README.md) · [Continue to Lesson 3](../03-screen-time/README.md)
