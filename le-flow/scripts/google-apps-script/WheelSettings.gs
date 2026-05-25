/**
 * LeStudy — Wheel Settings API (Google Apps Script)
 *
 * Spreadsheet: THƯ VIỆN LESTUDY
 * https://docs.google.com/spreadsheets/d/1FmzZ3l0OcNbfHgPNRWrMx0AsibM0EPIR_4_Iz56ERwI/edit
 *
 * Tab: WHEEL_SETTINGS
 * Columns (row 1 = headers, row 2 = data):
 *   A title        — Tiêu đề vòng quay
 *   B subtitle     — Mô tả phụ
 *   C options_json — JSON array of option strings, e.g. ["Đoán từ vựng","Hát một bài ngắn"]
 *   D updated_at   — ISO 8601 timestamp (UTC)
 *
 * Setup:
 * 1. Extensions → Apps Script → paste this file
 * 2. Project Settings → Script properties → WHEEL_SETTINGS_API_SECRET = (random secret)
 * 3. Run setupWheelSettingsSheet once (authorize)
 * 4. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone
 * 5. Copy Web App URL → Vercel env GOOGLE_APPS_SCRIPT_WEB_APP_URL
 */

var SPREADSHEET_ID = "1FmzZ3l0OcNbfHgPNRWrMx0AsibM0EPIR_4_Iz56ERwI";
var SHEET_NAME = "WHEEL_SETTINGS";
var HEADERS = ["title", "subtitle", "options_json", "updated_at"];

var DEFAULT_TITLE = "Vòng quay ngẫu nhiên";
var DEFAULT_SUBTITLE = "Quay để chọn hoạt động khởi động cho lớp.";
var DEFAULT_OPTIONS = [
  "Đoán từ vựng",
  "Hát một bài ngắn",
  "Kể chuyện 1 phút",
  "Trò chơi nhóm",
  "Ôn bài cũ",
];

function doGet(e) {
  try {
    if (!verifySecret_(e)) {
      return jsonResponse_({ ok: false, error: "Unauthorized" }, 401);
    }
    var data = readWheelSettings_();
    return jsonResponse_({ ok: true, data: data });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) }, 500);
  }
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: "Missing body" }, 400);
    }
    var body = JSON.parse(e.postData.contents);
    if (!verifySecretFromBody_(body, e)) {
      return jsonResponse_({ ok: false, error: "Unauthorized" }, 401);
    }
    var data = writeWheelSettings_({
      title: body.title,
      subtitle: body.subtitle,
      options: body.options,
    });
    return jsonResponse_({ ok: true, data: data });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) }, 500);
  }
}

/** Run once from Apps Script editor to create tab + headers + default row */
function setupWheelSettingsSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  writeWheelSettings_({
    title: DEFAULT_TITLE,
    subtitle: DEFAULT_SUBTITLE,
    options: DEFAULT_OPTIONS,
  });
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 320);
  sheet.setColumnWidth(3, 400);
  sheet.setColumnWidth(4, 180);
  Logger.log("WHEEL_SETTINGS sheet ready.");
}

function verifySecret_(e) {
  var expected = getSecret_();
  if (!expected) return false;
  var provided = e && e.parameter && e.parameter.secret;
  return provided === expected;
}

function verifySecretFromBody_(body, e) {
  var expected = getSecret_();
  if (!expected) return false;
  var fromBody = body && body.secret;
  var fromQuery = e && e.parameter && e.parameter.secret;
  return fromBody === expected || fromQuery === expected;
}

function getSecret_() {
  return PropertiesService.getScriptProperties().getProperty("WHEEL_SETTINGS_API_SECRET");
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Tab "' + SHEET_NAME + '" not found. Run setupWheelSettingsSheet() first.');
  }
  return sheet;
}

function readWheelSettings_() {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return getDefaultPayload_();
  }
  var row = sheet.getRange(2, 1, 1, 4).getValues()[0];
  var title = String(row[0] || "").trim() || DEFAULT_TITLE;
  var subtitle = String(row[1] || "").trim() || DEFAULT_SUBTITLE;
  var options = parseOptionsJson_(row[2]);
  var updatedAt = row[3] ? String(row[3]) : "";
  return {
    title: title,
    subtitle: subtitle,
    options: options,
    updatedAt: updatedAt,
  };
}

function writeWheelSettings_(input) {
  var sheet = getSheet_();
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  var title = String(input.title || "").trim() || DEFAULT_TITLE;
  var subtitle = String(input.subtitle || "").trim() || DEFAULT_SUBTITLE;
  var options = normalizeOptions_(input.options);
  var optionsJson = JSON.stringify(options);
  var updatedAt = new Date().toISOString();
  sheet.getRange(2, 1, 1, 4).setValues([[title, subtitle, optionsJson, updatedAt]]);
  return {
    title: title,
    subtitle: subtitle,
    options: options,
    updatedAt: updatedAt,
  };
}

function parseOptionsJson_(value) {
  if (!value) return DEFAULT_OPTIONS.slice();
  try {
    var parsed = JSON.parse(String(value));
    if (!Array.isArray(parsed)) return DEFAULT_OPTIONS.slice();
    var cleaned = parsed
      .map(function (item) {
        return String(item).trim();
      })
      .filter(function (item) {
        return item.length > 0;
      });
    return cleaned.length > 0 ? cleaned : DEFAULT_OPTIONS.slice();
  } catch (e) {
    return DEFAULT_OPTIONS.slice();
  }
}

function normalizeOptions_(options) {
  if (!options || !Array.isArray(options)) return DEFAULT_OPTIONS.slice();
  var cleaned = options
    .map(function (item) {
      return String(item).trim();
    })
    .filter(function (item) {
      return item.length > 0;
    });
  return cleaned.length > 0 ? cleaned : DEFAULT_OPTIONS.slice();
}

function getDefaultPayload_() {
  return {
    title: DEFAULT_TITLE,
    subtitle: DEFAULT_SUBTITLE,
    options: DEFAULT_OPTIONS.slice(),
    updatedAt: "",
  };
}

function jsonResponse_(payload, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
  // Apps Script web apps don't support custom HTTP status codes reliably; include ok flag
  if (statusCode && statusCode >= 400) {
    return output;
  }
  return output;
}
