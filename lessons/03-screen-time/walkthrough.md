# Walkthrough 3 · Add a screen-time chart

## 1. Add the canvas

In `index.html`, insert these elements immediately below the steps canvas:

```html
<h2>Daily screen time</h2>
<canvas id="minutes" aria-label="Daily screen time" role="img"></canvas>
```

## 2. Draw the second chart

Inside `drawCharts()` in `main.js`, find the `]);` that ends the steps chart call. Add the next line **below it**, before the function’s closing `}`:

```javascript
const minutes = readings(first, 'screen_total_min');
```

`first` still refers to the same participant. Changing the measurement name selects their screen-time row from the JSON you already fetched.

Now add the second chart call immediately below that line:

```javascript
draw('minutes', 'line', 'Minutes', [
  { label: first.name, data: minutes },
]);
```

The first argument matches the new canvas ID. The next two select a line chart and label its vertical axis in minutes. The dataset uses the participant’s name again, this time with the `minutes` points.

## 3. Check both charts

Save and find a date with readings for both measurements. The top bar should match `steps_count` and the lower point should match `screen_total_min`. If a reading contains text such as `"80min"`, correct the cell and refresh. Both charts update from the same response.

[Lesson plan](README.md) · [Continue to Lesson 4](../04-all-participants/README.md)
