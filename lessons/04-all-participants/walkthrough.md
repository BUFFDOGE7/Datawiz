# Walkthrough 4 · Chart every participant

## 1. Select the class

Set `TAB_GIDS` in `.env.local` to all the participant tab IDs, separated by commas. Include `0` if it is a participant tab. Leave out `Legend`. If you changed the settings, restart Vite and open **View full JSON**. Each returned sheet name will get a line in each comparison chart.

## 2. Add the comparison canvases

Below the first participant’s screen-time canvas in `index.html`, add:

```html
<h2>Steps by participant</h2>
<canvas id="all-steps" aria-label="Steps by participant" role="img"></canvas>
<h2>Screen time by participant</h2>
<canvas id="all-minutes" aria-label="Screen minutes by participant" role="img"></canvas>
```

## 3. Build one dataset per tab

Insert this function **above** `drawCharts()` in `main.js`, alongside `readings` and `draw`. It takes the whole `sheets` array and returns one chart dataset per tab.

```javascript
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
```

Read the helper in two passes:

1. **Collect the dates and values.** `sheets.map(...)` visits each tab. The shared `Set` keeps each date once. Each tab gets its own `Map`, called `byDate`, so you can look up that participant’s reading with `byDate.get(date)`.
2. **Build the lines.** `[...dates].sort()` turns the shared dates into an ordered list. For every participant, `calendar.map(...)` walks that list in the same order. For example, if one tab only has Friday and another only has Saturday, their values line up as `[4200, null]` and `[null, 3100]`. The code returns each value paired with its date so the existing `draw` function can use it.

## 4. Draw the two comparisons

Inside `drawCharts()`, add these calls immediately after the `draw('minutes', ...)` call from Lesson 3, before the function’s closing brace:

```javascript
draw('all-steps', 'line', 'Steps', participantDatasets(sheets, 'steps_count'));
draw('all-minutes', 'line', 'Minutes', participantDatasets(sheets, 'screen_total_min'));
```

Each call passes the datasets returned by the helper straight to `draw`. The canvas ID and measurement name are different for each chart. Save and refresh once. Check that both new legends list the names in **View full JSON**. Click a name to hide or show that line. Hover over a date and check one participant’s steps and screen minutes against their sheet. A participant with no readings still has a legend entry.

[Lesson plan](README.md) · [Course overview](../../README.md) · [Next lesson](../05-class-summary/README.md)
