# Walkthrough 1 · Read the class workbook

## 1. Start the server with the class sheet

On GitHub, choose **Fork → Create fork**. Copy the HTTPS URL from your fork’s **Code** menu. In VS Code, run **Git: Clone** from the Command Palette, paste the URL, and open the cloned folder.

In the folder containing `package.json`, duplicate `.env.example` and name the copy `.env.local`. Set `SHEET_ID` to the text between `/d/` and `/edit` in the workbook address. Select each participant tab and copy the digits after `gid=` into `TAB_GIDS`, separated by commas. The API returns tabs in that order. Leave out the dictionary tab named `Legend`. [Open the class workbook](https://docs.google.com/spreadsheets/d/1s4nyFtn0ek-uU156tPIC8pK1U8ytPmTOExY4d-ImGNk/edit)

Open **Terminal → New Terminal**. Check that Node is version 22.12 or newer, then install the dependencies and start Vite.

```bash
node -v
npm install
npm run dev
```

Append `/api/data` to the local address Vite prints, for example `http://127.0.0.1:5173/api/data`. Open that address in your browser. You should see an array with one object per configured tab. Find your tab’s `name` and `gid`, then expand its `steps_count` series.

## 2. Follow one cell through the server

In the workbook, find the row labeled `steps_count` in column A. Read its value in column B and the date above it in B2. In the matching tab’s JSON object, `steps_count[0]` pairs that date with the value. A blank reading is `null`, a recorded zero is `0`, and a mistyped entry such as `"80min"` stays visible as text.

1. Vite handles `/api/data` and calls `loadData`. [Route](../../vite.config.js)
2. `sheetNames` reads Google’s workbook viewer to match each configured `gid` with its tab name. [Data loader](../../server/data.js)
3. For each tab, `loadData` fetches its CSV export and passes it to `readSeries`. This function pairs each measurement with the date in the same column and groups the points under the row’s column A label.

Refresh the endpoint to read the latest export. If a tab is missing or Google returns a sign-in page, check its ID and CSV export access. [API reference](../../API.md)

[Lesson plan](README.md) · [Course overview](../../README.md)
