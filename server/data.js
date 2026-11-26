import { parse } from 'csv-parse/sync';
import JSON5 from 'json5';

async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Google Sheets returned HTTP ${response.status}.`);
  return response.text();
}

async function sheetNames(workbookUrl) {
  const html = await fetchText(`${workbookUrl}/htmlview`);
  const menuEntry = /items\.push\(\{\s*name:\s*("(?:\\.|[^"\\])*"),\s*pageUrl:\s*"(?:\\.|[^"\\])*",\s*gid:\s*"(\d+)"/g;
  const names = new Map();
  for (const [, title, gid] of html.matchAll(menuEntry)) {
    names.set(gid, JSON5.parse(title));
  }
  return names;
}

function readSeries(csv, gid, name) {
  const rows = parse(csv, { bom: true, relax_column_count: true });
  const dates = rows[1];
  if (dates?.[0]?.trim() !== 'date') throw new Error('Expected "date" in cell A2.');

  const sheet = { name, gid };
  for (const [label, ...cells] of rows.slice(2)) {
    const key = label?.trim();
    if (!key) continue;
    if (key in sheet) throw new Error(`Column A key "${key}" is already in use.`);
    const numeric = key.endsWith('_count') || key.endsWith('_min');
    const points = [];
    const width = Math.max(dates.length - 1, cells.length);
    for (let i = 0; i < width; i++) {
      const date = dates[i + 1]?.trim() || null;
      const cell = cells[i] ?? '';
      if (date === null && cell === '') continue;
      let value = cell === '' ? null : cell;
      // Keep a mistyped measurement visible so it can be corrected in the sheet.
      if (numeric && /^-?\d+(?:\.\d+)?$/.test(cell.trim())) value = Number(cell);
      points.push({ date, value });
    }
    sheet[key] = points;
  }
  return sheet;
}

export async function loadData(env) {
  const gids = [...new Set((env.TAB_GIDS ?? '').split(',').map(id => id.trim()).filter(Boolean))];
  if (!env.SHEET_ID || !gids.length) throw new Error('Set SHEET_ID and TAB_GIDS in .env.local, then restart Vite.');

  const workbookUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(env.SHEET_ID)}`;
  const names = await sheetNames(workbookUrl);
  return Promise.all(gids.map(async gid => {
    const name = names.get(gid);
    if (name === undefined) throw new Error(`Cannot find tab ${gid} in the workbook menu. Check the tab ID and workbook access.`);
    try {
      const csv = await fetchText(`${workbookUrl}/export?format=csv&gid=${encodeURIComponent(gid)}`);
      if (/^\s*(?:<!doctype html|<html\b)/i.test(csv)) throw new Error('Check CSV export access.');
      return readSeries(csv, gid, name);
    } catch (error) {
      throw new Error(`Could not read tab ${gid}: ${error.message}`);
    }
  }));
}
