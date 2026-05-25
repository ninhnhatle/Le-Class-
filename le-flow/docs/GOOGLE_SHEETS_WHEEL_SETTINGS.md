# Google Sheets — Lưu cài đặt vòng quay (WHEEL_SETTINGS)

Tài liệu này hướng dẫn kết nối **LeStudy** với Google Sheet [THƯ VIỆN LESTUDY](https://docs.google.com/spreadsheets/d/1FmzZ3l0OcNbfHgPNRWrMx0AsibM0EPIR_4_Iz56ERwI/edit?gid=0#gid=0) để lưu cài đặt vòng quay (tiêu đề, mô tả, danh sách lựa chọn).

Luồng dữ liệu:

```
Trình duyệt  →  /api/wheel-settings (Vercel / Next.js)  →  Apps Script Web App  →  Tab WHEEL_SETTINGS
```

Secret **không** gửi từ trình duyệt — chỉ server Vercel gọi Apps Script.

---

## 1. Cấu trúc tab `WHEEL_SETTINGS`

Tạo tab tên **`WHEEL_SETTINGS`** trong spreadsheet (hoặc chạy script `setupWheelSettingsSheet` ở bước 3).

| Cột | Tên cột | Mô tả | Ví dụ |
|-----|---------|--------|--------|
| **A** | `title` | Tiêu đề vòng quay | `Vòng quay ngẫu nhiên` |
| **B** | `subtitle` | Mô tả phụ dưới tiêu đề | `Quay để chọn hoạt động khởi động cho lớp.` |
| **C** | `options_json` | Danh sách lựa chọn dạng JSON (mảng chuỗi) | `["Đoán từ vựng","Hát một bài ngắn","Trò chơi nhóm"]` |
| **D** | `updated_at` | Thời gian cập nhật (UTC, ISO 8601) | `2026-05-25T08:30:00.000Z` |

- **Dòng 1**: tiêu đề cột (header)
- **Dòng 2**: dữ liệu đang dùng (một bản ghi duy nhất)

Bạn có thể sửa trực tiếp trên Sheet; lần mở app tiếp theo sẽ đọc lại từ Sheet (nếu đã deploy đủ bước dưới).

---

## 2. Google Apps Script

### 2.1 Mở project Apps Script

1. Mở [Google Sheet](https://docs.google.com/spreadsheets/d/1FmzZ3l0OcNbfHgPNRWrMx0AsibM0EPIR_4_Iz56ERwI/edit).
2. **Extensions** → **Apps Script**.
3. Xóa code mặc định, dán toàn bộ nội dung file trong repo:

   `scripts/google-apps-script/WheelSettings.gs`

4. Lưu project (tên gợi ý: `LeStudy Wheel Settings`).

### 2.2 Script property (mật khẩu API)

1. Trong Apps Script: **Project Settings** (biểu tượng bánh răng).
2. **Script properties** → **Add script property**:
   - **Property**: `WHEEL_SETTINGS_API_SECRET`
   - **Value**: chuỗi bí mật dài (ví dụ generate: `openssl rand -hex 32`)
3. **Lưu lại** — dùng **cùng giá trị** trên Vercel ở bước 4.

### 2.3 Chạy thiết lập sheet (một lần)

1. Trong editor Apps Script, chọn hàm **`setupWheelSettingsSheet`**.
2. **Run** → cho phép quyền truy cập spreadsheet.
3. Kiểm tra Sheet: tab `WHEEL_SETTINGS` có header + 1 dòng dữ liệu mẫu.

### 2.4 Deploy Web App

1. **Deploy** → **New deployment**.
2. Loại: **Web app**.
3. **Execute as**: `Me` (tài khoản Google của bạn).
4. **Who has access**: `Anyone` (bắt buộc để server Vercel gọi được; vẫn bảo vệ bằng `secret`).
5. **Deploy** → copy **Web app URL** (dạng `https://script.google.com/macros/s/...../exec`).

Lưu URL này cho biến `GOOGLE_APPS_SCRIPT_WEB_APP_URL`.

**Mỗi lần sửa code Apps Script**, tạo **New deployment** (hoặc Manage deployments → Edit → Version: New version) để URL `/exec` dùng code mới.

### 2.5 Kiểm tra Apps Script (tùy chọn)

Thay `YOUR_SECRET` và `YOUR_WEB_APP_URL`:

```bash
# Đọc cài đặt
curl "YOUR_WEB_APP_URL?secret=YOUR_SECRET"

# Ghi cài đặt
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SECRET",
    "title": "Vòng quay ngẫu nhiên",
    "subtitle": "Quay để chọn hoạt động khởi động cho lớp.",
    "options": ["Đoán từ vựng", "Hát một bài ngắn"]
  }'
```

Kết quả mong đợi: JSON `{ "ok": true, "data": { ... } }`.

---

## 3. Biến môi trường local (`.env.local`)

Trong thư mục `le-flow`:

```bash
cp .env.example .env.local
```

Sửa `.env.local`:

```env
GOOGLE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/xxxx/exec
WHEEL_SETTINGS_API_SECRET=your-secret-same-as-script-property
```

Chạy local:

```bash
npm run dev
```

Kiểm tra API:

- Mở: `http://localhost:3000/api/wheel-settings` → JSON có `source: "google_sheet"`.
- Trang chủ → **Khởi động** → **Cài đặt** → lưu → kiểm tra dòng 2 trên Sheet cập nhật.

---

## 4. Cấu hình Vercel (push là chạy)

Sau khi code đã có trên GitHub và project Vercel đã link repo:

### 4.1 Thêm Environment Variables

1. [Vercel Dashboard](https://vercel.com) → project **le-flow** (hoặc tên project của bạn).
2. **Settings** → **Environment Variables**.
3. Thêm **cả hai** biến (Production + Preview + Development nếu cần):

| Name | Value |
|------|--------|
| `GOOGLE_APPS_SCRIPT_WEB_APP_URL` | URL Web App `/exec` từ bước 2.4 |
| `WHEEL_SETTINGS_API_SECRET` | Cùng giá trị `WHEEL_SETTINGS_API_SECRET` trong Script properties |

4. **Save**.

### 4.2 Deploy lại

```bash
git add .
git commit -m "feat: sync wheel settings with Google Sheet"
git push
```

Vercel tự build/deploy. Không cần file `vercel.json` riêng cho tính năng này.

### 4.3 Kiểm tra trên production

Thay `https://your-app.vercel.app`:

```bash
curl https://your-app.vercel.app/api/wheel-settings
```

Trên app production: mở trang chủ → Khởi động → Cài đặt vòng quay → Lưu → xem Sheet.

---

## 5. Hành vi trong app

| Hành động | Kết quả |
|-----------|---------|
| Mở tab Khởi động | `GET /api/wheel-settings` → đọc Sheet (hoặc mặc định nếu chưa cấu hình) |
| Lưu trong dialog Cài đặt | `POST /api/wheel-settings` → ghi Sheet + cache `localStorage` |
| Chưa cấu hình env | Dùng giá trị mặc định trong code; hiện trạng thái “chưa kết nối Sheet” |

API route: `app/api/wheel-settings/route.ts`  
Client: `lib/wheel-settings/client.ts`

---

## 6. Xử lý sự cố

| Triệu chứng | Cách xử lý |
|-------------|------------|
| `Unauthorized` | Secret trên Vercel ≠ Script property; deploy lại Web App. |
| `Tab WHEEL_SETTINGS not found` | Chạy `setupWheelSettingsSheet` trong Apps Script. |
| `source: defaults` trên production | Thiếu env trên Vercel hoặc chưa redeploy sau khi thêm env. |
| POST 502 | Web App chưa deploy “Anyone”, hoặc URL sai (phải là `/exec`). |
| Sheet không đổi sau Lưu | Xem log Vercel → Functions; test `curl` POST trực tiếp tới Web App. |
| `options_json` lỗi | Phải là JSON hợp lệ, ví dụ `["a","b"]` — không có dấu nháy đơn kiểu Excel. |

---

## 7. Bảo mật

- **Không** commit `.env.local` hoặc secret vào Git.
- Chỉ Vercel + Apps Script biết `WHEEL_SETTINGS_API_SECRET`.
- Web App “Anyone” vẫn an toàn nếu secret đủ dài và không lộ ra client.
- Quyền sửa Sheet: chỉ tài khoản Google deploy Apps Script (Execute as: Me).

---

## 8. Tóm tắt checklist

- [ ] Tab `WHEEL_SETTINGS` + cột A–D
- [ ] Apps Script dán `WheelSettings.gs`
- [ ] Script property `WHEEL_SETTINGS_API_SECRET`
- [ ] Chạy `setupWheelSettingsSheet`
- [ ] Deploy Web App (Anyone) → copy URL
- [ ] Vercel: `GOOGLE_APPS_SCRIPT_WEB_APP_URL` + `WHEEL_SETTINGS_API_SECRET`
- [ ] `git push` → test `/api/wheel-settings` và Lưu trên UI
