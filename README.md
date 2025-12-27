# VocaNest – Web học tiếng Anh (HTML/CSS/JS + Supabase v1)

## Tổng quan
VocaNest là web học tiếng Anh chạy hoàn toàn trên **GitHub Pages**, sử dụng:
- HTML / CSS / JavaScript thuần
- Supabase JS **v1.35.7 (CDN)** cho Auth & Database
- Không backend riêng, không Supabase v2

---

## Công nghệ sử dụng
- Frontend: HTML5, CSS3 (custom, chia theo từng trang), JavaScript thuần
- Auth & DB: Supabase (PostgreSQL + Auth)
- Text-to-Speech: Web Speech API (trình duyệt)
- Deploy: GitHub Pages

---

## Kiến trúc Auth
- `auth.js`: xử lý đăng nhập / đăng ký
- `authGuard.js`: guard duy nhất cho toàn bộ trang private
- Không redirect loop
- Không dùng guard.js cũ

---

## Database (Supabase)

### Bảng `vocab_sets`
- `id`
- `user_id`
- `title`
- `description`
- `is_public`
- `created_at`

### Bảng `vocab_items`
- `id`
- `vocab_set_id`
- `user_id`
- `word`
- `meaning`
- `created_at`

### Bảng `profiles`
- `id` (FK → auth.users.id)
- `email`
- `created_at`

> Foreign keys:
- `vocab_sets.user_id → profiles.id`
- `vocab_items.user_id → profiles.id`

---

## Các chức năng đã hoàn thành

### 1. Auth
- Đăng ký / đăng nhập / đăng xuất ổn định
- Tự động tạo `profiles` khi user đăng ký
- Backfill `profiles` cho user cũ
- Trang thông tin tài khoản + đổi mật khẩu

---

### 2. Trang Home
- Hiển thị email user (link tới trang tài khoản)
- Điều hướng tới các chức năng chính

---

### 3. Trang Vocab Sets

#### Bộ của tôi
- Tạo bộ từ vựng (public / private)
- Hiển thị danh sách bộ của user
- Search client-side
- Xoá bộ (chỉ owner, xoá kèm vocab_items)
- Hiển thị số lượng từ trong mỗi bộ (badge)

#### Bộ công khai
- Hiển thị bộ public của user khác
- Hiển thị:
  - Email người tạo
  - Ngày tạo
  - Số lượng từ
- Search client-side
- Nút học Flashcards

#### UI / UX
- Card tối hơn, hài hoà với background
- Badge màu:
  - Công khai (xanh)
  - Riêng tư (cam)
- Badge số lượng từ gắn sát trạng thái
- Layout hai cột cân chiều cao

---

### 4. Trang Vocab Set Detail
- Kiểm tra quyền owner / public
- Thêm / xoá từ (owner)
- Search word / meaning (client-side, cache)
- Scroll nội bộ khi danh sách dài
- Import từ vựng từ file Excel (.xlsx)

---

### 5. Flashcards
- Load vocab theo `vocab_set_id`
- Card lật (flip animation)
- Hiển thị progress (x / total)
- Shuffle flashcards
- Text-to-Speech:
  - Chọn tốc độ đọc
  - Auto speak bật / tắt (lưu localStorage)
- Nút nghe / đánh dấu từ nhúng trong card (icon + tooltip)
- Layout tinh gọn, responsive

---

## Cấu trúc thư mục (rút gọn)

```
assets/
  css/
    base.css
    home.css
    vocab-sets.css
    vocab-set-detail.css
    flashcards.css
  js/
    config.js
    supabaseClient.js
    auth.js
    authGuard.js
    home.js
    vocabSets.js
    vocabSetDetail.js
    flashcards.js
pages/
  home.html
  vocab-sets.html
  vocab-set-detail.html
  flashcards.html
  account.html
  auth.html
```

---

## Ghi chú kiến trúc quan trọng
- Không JOIN trực tiếp `auth.users` từ frontend
- Thông tin public user lấy qua bảng `profiles`
- Query tối ưu, không N+1
- CSS tách theo từng trang, `base.css` chỉ chứa style chung

---

## Hướng phát triển tiếp theo
- Bookmark bộ công khai
- Clone bộ công khai về bộ của tôi
- Thống kê học tập
- Upload đề TOEIC / IELTS
