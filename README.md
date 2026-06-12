# VocaNest

VocaNest la web hoc tu vung tieng Anh bang HTML/CSS/JavaScript thuan. Du lieu duoc luu trong Google Sheets, xu ly boi Google Apps Script va truy cap qua Cloudflare Worker proxy.

## Cong nghe

- Frontend: HTML, CSS, JavaScript thuan
- Backend API: Google Apps Script Web App
- API proxy: Cloudflare Worker
- Database: Google Sheets trong Google Drive
- Text-to-Speech: Web Speech API
- Deploy frontend: GitHub Pages hoac static hosting bat ky

## Kien truc

```text
VocaNest frontend
  -> fetch()
Cloudflare Worker
  -> secret Apps Script URL
Google Apps Script Web App
  -> SpreadsheetApp
Google Sheets database
```

## Database Sheets

Apps Script tu tao cac sheet sau trong Google Sheets:

```text
users
vocab_sets
vocab_items
password_resets
```

## Chuc nang

- Dang ky, dang nhap, dang xuat
- Luu session token tren trinh duyet bang localStorage
- Doi mat khau
- Quen mat khau qua email Apps Script
- Tao, xem, xoa bo tu vung
- Bo tu rieng tu/cong khai
- Them, xoa, import tu vung tu Excel
- Hoc bang flashcards
- Shuffle, Text-to-Speech, danh dau tu kho/da nho

## Cau truc chinh

```text
apps-script/
  Code.gs
cloudflare-worker/
  src/index.js
  wrangler.jsonc
assets/
  css/
  js/
    apiClient.js
    auth.js
    authGuard.js
    config.js
    vocabSets.js
    vocabSetDetail.js
    flashcards.js
pages/
  auth.html
  home.html
  vocab-sets.html
  vocab-set-detail.html
  flashcards.html
  account.html
  forgot-password.html
  reset-password.html
```

## Setup

Lam theo cac file:

```text
GOOGLE_APPS_SCRIPT_SETUP.md
CLOUDFLARE_PROXY_SETUP.md
```

Tom tat:

1. Tao Google Sheet `VocaNestDB`.
2. Copy Spreadsheet ID.
3. Tao Apps Script, paste `apps-script/Code.gs`.
4. Thay `SPREADSHEET_ID`.
5. Deploy Apps Script Web App voi `Execute as: Me`, `Who has access: Anyone`.
6. Luu Web App URL `/exec` vao Cloudflare Secret.
7. Deploy Worker.
8. Dan URL Worker vao `assets/js/config.js`.

## Luu y bao mat

Day la backend tu viet tren Apps Script. Mat khau duoc hash SHA-256 kem salt, nhung giai phap nay van phu hop nhat cho app ca nhan, demo, lop hoc nho hoac du lieu khong qua nhay cam. Neu app co nhieu user hoac yeu cau bao mat cao, nen dung backend/database chuyen dung.
