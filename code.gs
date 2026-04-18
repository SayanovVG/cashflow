// CASHFLOW · Google Apps Script бэкенд
// Хранит всё состояние (транзакции, долги, повторяющиеся) JSON'ом в ячейке A1
// листа "cashflow_state". Просто и надёжно.

const SHEET_NAME = 'cashflow_state';

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'list') {
    return json({ ok: true, state: loadState() });
  }
  return json({ ok: false, error: 'unknown action' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'save') {
      saveState(body.state);
      return json({ ok: true });
    }
    return json({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) s = ss.insertSheet(SHEET_NAME);
  return s;
}

function loadState() {
  const v = sheet_().getRange('A1').getValue();
  if (!v) return null;
  try { return JSON.parse(v); } catch (e) { return null; }
}

function saveState(state) {
  sheet_().getRange('A1').setValue(JSON.stringify(state));
}
