/**
 * LeStudy — Step Settings API (Google Apps Script)
 *
 * Spreadsheet: THƯ VIỆN LESTUDY
 * https://docs.google.com/spreadsheets/d/1FmzZ3l0OcNbfHgPNRWrMx0AsibM0EPIR_4_Iz56ERwI/edit
 *
 * Tabs (one per teaching step):
 *   STEP_WARMUP    — Khởi động
 *   STEP_KNOWLEDGE — Hình thành kiến thức
     *   STEP_PRACTICE  — Luyện tập
 *
 * Columns (row 1 = headers, row 2 = data):
 *   A settings_json — Full JSON settings for the step
 *   B updated_at    — ISO 8601 timestamp (UTC)
 *
 * API (same Web App URL as WHEEL_SETTINGS):
 *   GET  ?secret=...&resource=step&step=warmup|knowledge|practice
 *   POST { secret, step, settings }
 *
 * Setup:
 * 1. Add this file to the same Apps Script project as WheelSettings.gs
 * 2. Update doGet/doPost in WheelSettings.gs to route resource=step (see router snippet in docs)
 * 3. Run setupAllStepSettingsSheets once
 * 4. Redeploy Web App (New version)
 */

var STEP_SPREADSHEET_ID = "1FmzZ3l0OcNbfHgPNRWrMx0AsibM0EPIR_4_Iz56ERwI";
var STEP_HEADERS = ["settings_json", "updated_at"];
var VALID_STEPS = ["warmup", "knowledge", "practice"];

var STEP_DEFAULTS = {
  warmup: {
    title: "Xổ số khởi động",
    subtitle: "Bấm quay để chọn số hoặc thử thách ngẫu nhiên.",
    resultDialogTitle: "Xin mời",
    resultLabel: "Bạn được chọn là",
    mode: "range",
    listValues: ["Nhóm 1", "Nhóm 2", "Nhóm 3", "Nhóm 4", "Nhóm 5"],
    maxNumber: 40,
  },
  knowledge: {
    videoSource: "sample",
    videoName: "knowledge-sample.mp4",
    questions: [],
  },
  practice: {
    title: "Luyện tập có thưởng",
    subtitle: "Trả lời đúng để quay vòng quay nhận phần quà.",
    allowMultipleAttempts: true,
    requiredAttemptToUnlock: 1,
    questions: [],
    prizeOptions: [
      "Sticker ngôi sao",
      "+2 điểm cộng",
      "Miễn 1 câu hỏi",
      "Chọn bài hát lớp",
      "Quyền trả lời trước",
      "Kẹo / quà nhỏ",
    ],
  },
};

function handleStepSettingsGet_(e) {
  try {
    if (!verifyStepSecret_(e)) {
      return stepJsonResponse_({ ok: false, error: "Unauthorized" }, 401);
    }
    var step = normalizeStepId_(e.parameter && e.parameter.step);
    if (!step) {
      return stepJsonResponse_({ ok: false, error: "Missing or invalid step" }, 400);
    }
    var data = readStepSettings_(step);
    return stepJsonResponse_({ ok: true, data: data });
  } catch (err) {
    return stepJsonResponse_({ ok: false, error: String(err) }, 500);
  }
}

function handleStepSettingsPost_(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return stepJsonResponse_({ ok: false, error: "Missing body" }, 400);
    }
    var body = JSON.parse(e.postData.contents);
    if (!verifyStepSecretFromBody_(body, e)) {
      return stepJsonResponse_({ ok: false, error: "Unauthorized" }, 401);
    }
    var step = normalizeStepId_(body.step);
    if (!step) {
      return stepJsonResponse_({ ok: false, error: "Missing or invalid step" }, 400);
    }
    var data = writeStepSettings_(step, body.settings);
    return stepJsonResponse_({ ok: true, data: data });
  } catch (err) {
    return stepJsonResponse_({ ok: false, error: String(err) }, 500);
  }
}

/** Run once to create STEP_WARMUP, STEP_KNOWLEDGE, STEP_PRACTICE tabs */
function setupAllStepSettingsSheets() {
  VALID_STEPS.forEach(function (step) {
    setupStepSettingsSheet_(step);
  });
  Logger.log("All STEP_* sheets ready.");
}

function setupStepSettingsSheet_(step) {
  var ss = SpreadsheetApp.openById(STEP_SPREADSHEET_ID);
  var sheetName = getStepSheetName_(step);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clear();
  sheet.getRange(1, 1, 1, STEP_HEADERS.length).setValues([STEP_HEADERS]);
  sheet.getRange(1, 1, 1, STEP_HEADERS.length).setFontWeight("bold");
  writeStepSettings_(step, STEP_DEFAULTS[step]);
  sheet.setColumnWidth(1, 720);
  sheet.setColumnWidth(2, 180);
  Logger.log(sheetName + " ready.");
}

function verifyStepSecret_(e) {
  var expected = getStepSecret_();
  if (!expected) return false;
  var provided = e && e.parameter && e.parameter.secret;
  return provided === expected;
}

function verifyStepSecretFromBody_(body, e) {
  var expected = getStepSecret_();
  if (!expected) return false;
  var fromBody = body && body.secret;
  var fromQuery = e && e.parameter && e.parameter.secret;
  return fromBody === expected || fromQuery === expected;
}

function getStepSecret_() {
  return PropertiesService.getScriptProperties().getProperty("WHEEL_SETTINGS_API_SECRET");
}

function normalizeStepId_(value) {
  var step = String(value || "").trim().toLowerCase();
  return VALID_STEPS.indexOf(step) >= 0 ? step : null;
}

function getStepSheetName_(step) {
  return "STEP_" + step.toUpperCase();
}

function getStepSheet_(step) {
  var ss = SpreadsheetApp.openById(STEP_SPREADSHEET_ID);
  var sheetName = getStepSheetName_(step);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Tab "' + sheetName + '" not found. Run setupAllStepSettingsSheets() first.');
  }
  return sheet;
}

function readStepSettings_(step) {
  var sheet = getStepSheet_(step);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      settings: STEP_DEFAULTS[step],
      updatedAt: "",
    };
  }
  var row = sheet.getRange(2, 1, 1, 2).getValues()[0];
  var settings = parseSettingsJson_(step, row[0]);
  var updatedAt = row[1] ? String(row[1]) : "";
  return {
    settings: settings,
    updatedAt: updatedAt,
  };
}

function writeStepSettings_(step, inputSettings) {
  var sheet = getStepSheet_(step);
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, STEP_HEADERS.length).setValues([STEP_HEADERS]);
  }
  var settings = normalizeSettingsObject_(step, inputSettings);
  var settingsJson = JSON.stringify(settings);
  var updatedAt = new Date().toISOString();
  sheet.getRange(2, 1, 1, 2).setValues([[settingsJson, updatedAt]]);
  return {
    settings: settings,
    updatedAt: updatedAt,
  };
}

function parseSettingsJson_(step, value) {
  if (!value) return cloneObject_(STEP_DEFAULTS[step]);
  try {
    var parsed = JSON.parse(String(value));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return cloneObject_(STEP_DEFAULTS[step]);
    }
    return normalizeSettingsObject_(step, parsed);
  } catch (e) {
    return cloneObject_(STEP_DEFAULTS[step]);
  }
}

function normalizeSettingsObject_(step, input) {
  var defaults = STEP_DEFAULTS[step];
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return cloneObject_(defaults);
  }
  var merged = cloneObject_(defaults);
  Object.keys(defaults).forEach(function (key) {
    if (input[key] !== undefined && input[key] !== null) {
      merged[key] = input[key];
    }
  });
  return merged;
}

function cloneObject_(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function stepJsonResponse_(payload, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
  if (statusCode && statusCode >= 400) {
    return output;
  }
  return output;
}
