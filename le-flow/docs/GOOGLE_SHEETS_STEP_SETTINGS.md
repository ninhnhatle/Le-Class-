# Google Sheets — Lưu cài đặt theo bước dạy (STEP_*)

Tài liệu này hướng dẫn lưu cài đặt **Khởi động**, **Hình thành kiến thức**, **Luyện tập** lên Google Sheet [THƯ VIỆN LESTUDY](https://docs.google.com/spreadsheets/d/1FmzZ3l0OcNbfHgPNRWrMx0AsibM0EPIR_4_Iz56ERwI/edit), cùng Web App với `WHEEL_SETTINGS`.

```
Trình duyệt  →  /api/step-settings/{step}  →  Apps Script  →  Tab STEP_WARMUP | STEP_KNOWLEDGE | STEP_PRACTICE
```

| Step (URL) | Tab Sheet | Giai đoạn |
|------------|-----------|-----------|
| `warmup` | `STEP_WARMUP` | Khởi động |
| `knowledge` | `STEP_KNOWLEDGE` | Hình thành kiến thức |
| `practice` | `STEP_PRACTICE` | Luyện tập |

Secret **không** gửi từ trình duyệt — chỉ server Vercel gọi Apps Script (dùng chung `WHEEL_SETTINGS_API_SECRET`).

---

## 1. Cấu trúc mỗi tab STEP_*

Mỗi tab lưu **một dòng** cài đặt (JSON đầy đủ):

| Cột | Tên cột | Mô tả |
|-----|---------|--------|
| **A** | `settings_json` | Toàn bộ settings của step (JSON) |
| **B** | `updated_at` | Thời gian cập nhật UTC (ISO 8601) |

- **Dòng 1**: header
- **Dòng 2**: dữ liệu đang dùng

### Ví dụ `settings_json`

**STEP_WARMUP** (`warmup`):
```json
{
  "title": "Xổ số khởi động",
  "subtitle": "Bấm quay để chọn số hoặc thử thách ngẫu nhiên.",
  "resultDialogTitle": "Xin mời",
  "resultLabel": "Bạn được chọn là",
  "mode": "range",
  "listValues": ["Nhóm 1", "Nhóm 2"],
  "maxNumber": 40
}
```

**STEP_KNOWLEDGE** (`knowledge`):
```json
{
  "videoSource": "sample",
  "videoName": "knowledge-sample.mp4",
  "questions": [
    {
      "id": "q-1",
      "timeSeconds": 15,
      "type": "multiple_choice",
      "prompt": "Câu hỏi mẫu",
      "options": ["A", "B", "C"],
      "correctIndex": 1
    }
  ]
}
```

> Video tự upload (`videoSource: "custom"`) chỉ lưu metadata trên Sheet; file video nằm trong IndexedDB trên máy trình duyệt đó.

**STEP_PRACTICE** (`practice`):
```json
{
  "title": "Luyện tập có thưởng",
  "subtitle": "Trả lời đúng để quay vòng quay nhận phần quà.",
  "allowMultipleAttempts": true,
  "requiredAttemptToUnlock": 1,
  "questions": [],
  "prizeOptions": ["Sticker ngôi sao", "+2 điểm cộng"]
}
```

---

## 2. Google Apps Script

### 2.1 Thêm file Step Settings

1. Mở [Google Sheet](https://docs.google.com/spreadsheets/d/1FmzZ3l0OcNbfHgPNRWrMx0AsibM0EPIR_4_Iz56ERwI/edit) → **Extensions** → **Apps Script**.
2. Giữ file `WheelSettings.gs` (đã có router `resource=step`).
3. Thêm file mới, dán nội dung:

   `scripts/google-apps-script/StepSettings.gs`

4. **Lưu** project.

### 2.2 Cập nhật router (nếu chưa có)

Trong `WheelSettings.gs`, `doGet` / `doPost` phải ủy quyền cho step settings (repo đã cập nhật):

```javascript
function doGet(e) {
  if (e && e.parameter && e.parameter.resource === "step") {
    return handleStepSettingsGet_(e);
  }
  // ... wheel GET
}

function doPost(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      var peek = JSON.parse(e.postData.contents);
      if (peek && peek.step && peek.settings) {
        return handleStepSettingsPost_(e);
      }
    } catch (ignore) {}
  }
  // ... wheel POST
}
```

### 2.3 Script property

Dùng **cùng** secret với vòng quay:

- Property: `WHEEL_SETTINGS_API_SECRET`
- Value: chuỗi bí mật (giống trên Vercel)

### 2.4 Chạy thiết lập sheet (một lần)

1. Chọn hàm **`setupAllStepSettingsSheets`**
2. **Run** → cấp quyền spreadsheet
3. Kiểm tra các tab: `STEP_WARMUP`, `STEP_KNOWLEDGE`, `STEP_PRACTICE`

### 2.5 Redeploy Web App

Sau khi thêm/sửa code:

1. **Deploy** → **Manage deployments** → **Edit** → Version: **New version**
2. Hoặc **New deployment** → Web app → Execute as: **Me**, Who has access: **Anyone**
3. URL `/exec` giữ nguyên nếu edit deployment hiện tại

---

## 3. Biến môi trường Vercel

Dùng chung với WHEEL_SETTINGS (không cần thêm biến mới):

| Biến | Mô tả |
|------|--------|
| `GOOGLE_APPS_SCRIPT_WEB_APP_URL` | URL Web App `/exec` |
| `WHEEL_SETTINGS_API_SECRET` | Cùng secret trong Script properties |

Sau khi thêm/sửa env → **Redeploy** Production.

---

## 4. Kiểm tra API

```bash
# Đọc warmup
curl "https://your-app.vercel.app/api/step-settings/warmup"

# Đọc knowledge
curl "https://your-app.vercel.app/api/step-settings/knowledge"

# Ghi practice (qua server — ví dụ local)
curl -X POST "http://localhost:3000/api/step-settings/practice" \
  -H "Content-Type: application/json" \
  -d '{"title":"Luyện tập","subtitle":"...","allowMultipleAttempts":true,"requiredAttemptToUnlock":1,"questions":[],"prizeOptions":["Quà 1"]}'
```

Response thành công: `"source": "google_sheet"`, `"ok": true`.

---

## 5. Luồng trong app

| Hành động | Hành vi |
|-----------|---------|
| Mở tab | `GET /api/step-settings/{step}` → đọc Sheet; fallback `localStorage` nếu Sheet lỗi |
| Lưu cài đặt / auto-save | `POST /api/step-settings/{step}` → ghi Sheet + cache local |

Code:

- API: `app/api/step-settings/[step]/route.ts`
- Server: `lib/step-settings/google-sheet-server.ts`
- Client: `lib/step-settings/client.ts`, `lib/step-settings/storage.ts`

---

## 6. Xử lý sự cố

| Triệu chứng | Cách xử lý |
|-------------|------------|
| `Tab STEP_WARMUP not found` | Chạy `setupAllStepSettingsSheets` |
| `Unauthorized` | Secret Vercel ≠ Script property |
| `source: "defaults"` | Chưa cấu hình env hoặc Sheet lỗi — app dùng mặc định + cache local |
| Sửa Sheet không đổi trên app | Reload trang (GET mới); kiểm tra JSON cột A hợp lệ |

---

## Checklist

- [ ] File `StepSettings.gs` trong Apps Script project
- [ ] Router `resource=step` trong `WheelSettings.gs`
- [ ] Chạy `setupAllStepSettingsSheets`
- [ ] Redeploy Web App (New version)
- [ ] Vercel: `GOOGLE_APPS_SCRIPT_WEB_APP_URL` + `WHEEL_SETTINGS_API_SECRET`
- [ ] Test `/api/step-settings/warmup`, `knowledge`, `practice`
