# VocaNest – Web học từ vựng tiếng Anh

VocaNest là một web học tiếng Anh đơn giản, chạy hoàn toàn bằng **HTML, CSS, JavaScript thuần** và deploy trên **GitHub Pages**.  
Dự án tập trung vào việc học từ vựng thông qua **bộ từ vựng** và **flashcards**, kết hợp Supabase để xác thực và lưu trữ dữ liệu.

---

## 1. Công nghệ sử dụng

### Frontend
- HTML5
- CSS3 (custom CSS, không dùng framework)
- JavaScript thuần (ES6+)
- Không dùng bundler, không dùng framework (React/Vue)

### Backend as a Service
- **Supabase**
  - Supabase JS v1.35.7 (CDN)
  - Supabase Auth: đăng nhập / đăng ký bằng email + password
  - Supabase Database (PostgreSQL)
    - Bảng `vocab_sets`
    - Bảng `vocab_items`
  - RLS (Row Level Security) bật, truy cập theo user

### Khác
- GitHub Pages: deploy frontend
- VS Code: phát triển và test local (Live Server)

---

## 2. Kiến trúc tổng quát

- Mỗi trang HTML load JS riêng, không dùng JS chung cho nhiều trang (tránh trùng biến).
- Auth flow được **centralize** bằng `authGuard.js`.
- Không dùng Supabase v2 để tránh lỗi CDN, dùng Supabase v1 ổn định.

### Các file JS chính
- `config.js`  
  Chứa SUPABASE_URL và SUPABASE_ANON_KEY.
- `supabaseClient.js`  
  Khởi tạo `supabaseClient` từ Supabase v1 CDN.
- `auth.js`  
  Chỉ dùng cho `auth.html` (login / register).
- `authGuard.js`  
  Guard duy nhất cho tất cả trang private.
- `home.js`  
  Trang home (hiển thị email user, logout).
- `vocabSets.js`  
  Trang danh sách bộ từ vựng.
- `vocabSetDetail.js`  
  Trang chi tiết bộ từ vựng.

---

## 3. Các chức năng đã hoàn thành

### 3.1. Xác thực người dùng
- Đăng ký tài khoản bằng email + password.
- Đăng nhập.
- Tự động redirect:
  - Đã login → vào trang home.
  - Chưa login → bị chặn ở các trang private.
- Đăng xuất (logout) ổn định, không bị loop.

### 3.2. Trang Home
- Hiển thị email người dùng đang đăng nhập.
- Nút đăng xuất.

### 3.3. Quản lý bộ từ vựng (vocab-sets.html)
- Tạo bộ từ vựng mới:
  - Tên bộ
  - Mô tả (không bắt buộc)
  - Chọn công khai / riêng tư
- Hiển thị:
  - Bộ từ vựng của tôi
  - Bộ từ vựng công khai của người khác
- Scroll nội bộ cho từng box khi có nhiều bộ.
- Tìm kiếm nhanh theo **tên bộ từ vựng** (client-side).
- Không query lại database khi search.

### 3.4. Chi tiết bộ từ vựng (vocab-set-detail.html)
- Kiểm tra quyền truy cập:
  - Owner: xem + thêm + xoá từ.
  - Không phải owner:
    - Nếu public: chỉ xem.
    - Nếu private: bị chặn.
- Hiển thị danh sách từ vựng:
  - Từ
  - Nghĩa
- Thêm từ mới (owner).
- Xoá từ (owner).
- Tìm kiếm nhanh theo:
  - Word
  - Meaning
- Search hoạt động trên data cache, không query lại Supabase.

---

## 4. Database (Supabase)

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

---

## 5. Những quyết định kỹ thuật quan trọng

- Không dùng Supabase JS v2 vì:
  - CDN không ổn định cho browser thuần.
- Không dùng async guard ở nhiều nơi:
  - Tránh redirect loop.
- Mỗi trang chỉ load JS của chính nó:
  - Tránh lỗi `Identifier has already been declared`.
- Search/filter luôn dựa trên **data gốc trong JS**, không thao tác trực tiếp DOM.

---

## 6. Các hướng phát triển tiếp theo (chưa làm)

- Flashcards:
  - Lật thẻ
  - Shuffle
  - Đánh dấu từ khó
- Thống kê:
  - Số lượng từ trong mỗi bộ
  - Tiến độ học
- Upload đề TOEIC / IELTS:
  - Lưu file trên Google Drive
  - Quản lý metadata bằng Google Apps Script
- Phân trang (pagination) hoặc infinite scroll cho bộ lớn.

---

## 7. Ghi chú khi tiếp tục phát triển

Khi mở lại dự án hoặc tạo chat mới:
- Nhớ rằng project đang dùng **Supabase v1 + CDN**.
- Auth đã được centralize bằng `authGuard.js`.
- Không dùng lại `guard.js` cũ.
- Không trộn logic của `home.js` vào các trang khác.

---

© VocaNest – English Vocabulary Learning Project
