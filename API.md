# Read the sheet as JSON

Set `SHEET_ID` and `TAB_GIDS` in `.env.local`, start Vite, and open `/api/data`. Each refresh reads the current Google Sheets exports. The response is an array in the order of `TAB_GIDS`. To include a missing tab, select it in Sheets and add the digits after `gid=` to the list. An ID of `0` is valid.

Each object has the tab’s actual `name` and `gid`. Each measurement label in column A becomes a key holding a series of `{ date, value }` points. For example:

```json
[
  {
    "name": "Friday log",
    "gid": "42",
    "steps_count": [
      { "date": "2026-11-13", "value": 7777 },
      { "date": "2026-11-14", "value": 0 }
    ],
    "screen_total_min": [
      { "date": "2026-11-13", "value": "80min" },
      { "date": "2026-11-14", "value": null }
    ],
    "screen_app1_name": [
      { "date": "2026-11-13", "value": "Maps" },
      { "date": "2026-11-14", "value": null }
    ]
  }
]
```

For B3, the key comes from A3, the date from B2, and the value from B3. Points keep the spreadsheet’s column order. A blank measurement on a dated day gets `null`. A filled measurement with a missing date gets `date: null` so you can find and fix it. Decimal and whole numbers in rows ending in `_count` or `_min` become JSON numbers. Other entries retain their exported text.

## How the server reads it

1. Vite handles `/api/data` and calls `loadData`. [Route](vite.config.js)
2. `sheetNames` reads the Google Sheets HTML viewer’s tab menu to match each configured ID with its title. The workbook must allow access without sign-in. [Data loader](server/data.js)
3. `loadData` downloads one CSV per selected tab. `readSeries` reads dates from row 2 and uses each named measurement row from row 3 onward to build the series. [Workbook settings](.env.example)
