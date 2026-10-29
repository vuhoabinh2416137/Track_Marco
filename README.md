# 🚀 MacroTrack — Nền Tảng Theo Dõi Dinh Dưỡng & Thể Hình Chuẩn Khoa Học

> **MacroTrack** là nền tảng PWA (Progressive Web App) Mobile-First thế hệ mới, dung hợp triết lý **Không phán xét (Adherence-Neutral)** & **TDEE động** của MacroFactor, **Trải nghiệm thị giác & Nhịn ăn gián đoạn** của YAZIO, cùng **Độ phủ món ăn Việt Nam** của Viện Dinh Dưỡng Quốc Gia.

---

## 🌟 Điểm Nhấn Cốt Lõi So Với Các App Hiện Tại

| Tính năng | **MyFitnessPal** | **MacroFactor** | **YAZIO** | **MacroTrack (Dự án này)** |
| :--- | :--- | :--- | :--- | :--- |
| **Bản quyền** | Trả phí cao ($19.99/tháng), quét mã bị khóa ở bản Free | Thuần trả phí ($71.99/năm) | Trả phí theo năm | **Hoàn toàn thuộc sở hữu của bạn, không thu phí** |
| **Mô hình Năng lượng** | Tĩnh, cho phép ăn bù calo từ smartwatch gây thừa mỡ | **Động (Expenditure Engine)** | Tĩnh, BMR cố định | **Động thích ứng (Closed-Loop Energy Balance)** |
| **Cân nặng Xu hướng** | Cân thô (Scale weight), nhiễu nước | **Weight Trend EMA** | Đo vòng eo, cân thô | **Irregular-Sample EMA** (xử lý cả khi cân không đều đặn) |
| **Phân loại Ngày** | Không có (quên log -> sụt TDEE) | Day Classification | Không có | **Valid vs Partial vs Blank** (chống sụt giảm calo đột ngột) |
| **Nhịn ăn Gián đoạn** | Không có hoặc đơn sơ | Cố tình không hỗ trợ | Đẹp mắt, nhiều giai đoạn | **Tích hợp đồng hồ sinh học (Ketosis, Autophagy)** |
| **Dữ liệu Món Việt** | Nhiều dữ liệu rác, sai lệch calo | Không có món Việt | Ít món Việt | **Bộ dữ liệu chuẩn Viện Dinh Dưỡng QG (620 món)** |
| **Nhập liệu AI** | Khóa trả phí | Có AI Describe | Có AI Photo | **AI Natural Language Parsing Tiếng Việt** |
| **Nền tảng** | Cài qua App Store / CH Play | Cài qua App Store / CH Play | Cài qua App Store / CH Play | **PWA Mobile-First**: Mở trực tiếp trên web, Add to Home Screen |

---

## 📐 Kiến Trúc Hệ Thống (Decoupled Architecture)

```
c:\Users\mrore\Track_Marco\
├── backend/                       # Spring Boot 3 (Java 17/21) REST API
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/macrotrack/
│       │   ├── domain/algorithm/  # Thuật toán EMA & TDEE thích ứng
│       │   ├── model/             # JPA Entities (Profile, Weight, Food, Meal, Water, Fasting, Workout)
│       │   ├── repository/        # Spring Data JPA Repositories
│       │   ├── service/           # Business Logic
│       │   ├── controller/        # REST APIs (/api/v1/...)
│       │   └── config/            # CORS & Data Loader
│       └── main/resources/
│           ├── application.yml
│           └── data/nin_foods.json # 620 món ăn chuẩn Viện Dinh Dưỡng
├── frontend/                      # Next.js 14/15 PWA Mobile-First
│   ├── package.json
│   ├── next.config.mjs
│   ├── public/
│   │   ├── manifest.json          # PWA Manifest (Standalone display)
│   │   └── sw.js                  # Service Worker (Offline Cache)
│   └── src/
│       ├── app/                   # App Router (Dashboard, Diary, Weight, Workout, Settings)
│       ├── components/            # MacroRings, FastingWidget, WaterWidget, FoodSearchModal
│       └── lib/                   # API Client & Types
├── docker-compose.yml             # Full-stack Containerization
└── README.md
```

---

## 🧠 Bộ Ba Thuật Toán Khoa Học Cốt Lõi (Backend)

### 1. `IrregularWeightTrendEngine.java`
Khử nhiễu tích nước ngắn hạn (từ Natri/Carb) bằng Exponential Moving Average với bước thời gian thực tế:
$$\alpha_{\text{eff}} = 1 - (1 - \alpha_{\text{nominal}})^{\Delta t}$$
Đảm bảo nếu bạn cách 3–5 ngày mới cân, giá trị mới vẫn được tính toán chuẩn xác mà không bị trễ pha.

### 2. `AdaptiveExpenditureEngineV3.java`
Tự động giải phương trình cân bằng năng lượng:
$$\text{TDEE} = \text{Lượng ăn trung bình} - \frac{\Delta \text{Cân nặng Trend} \times 7700}{\text{Số ngày}}$$
- **Chống Crash Calo**: Tự động phân loại `VALID` (log đủ), `PARTIAL` (chỉ log 1-2 món rồi quên -> LOẠI BỎ khỏi mẫu số), và `BLANK` (không log gì -> bỏ qua an toàn).
- **Calorie Floor Protection**: Ngưỡng sàn tối thiểu 1200 kcal (nữ) và 1500 kcal (nam).

### 3. `OneRepMaxCalculator.java`
Ước tính sức mạnh tối đa 1RM theo công thức Epley chuẩn hóa:
$$\text{1RM} = \text{Mức tạ (kg)} \times \left(1 + \frac{\text{Số lần reps}}{30}\right)$$

---

## 💻 Hướng Dẫn Chạy Cục Bộ (Local Development)

### ⚡ Cách 1: Sử Dụng Script 1-Click (Khuyên Dùng Trên Windows)
- **Khởi động toàn bộ hệ thống**: Nhấp đúp chuột vào file [`start.bat`](file:///c:/Users/mrore/Track_Marco/start.bat).
  - Tự động bật Backend Spring Boot 3 ở cổng `8080`.
  - Tự động bật Frontend Next.js PWA ở cổng `3000`.
  - Tự động mở trình duyệt web tại `http://localhost:3000`.
- **Dừng toàn bộ hệ thống**: Nhấp đúp chuột vào file [`stop.bat`](file:///c:/Users/mrore/Track_Marco/stop.bat).
  - Tự động giải phóng cổng 8080 và 3000, đóng sạch các tiến trình ngầm.

---

### 🛠️ Cách 2: Chạy Thủ Công Từng Dịch Vụ
Yêu cầu: Đã cài Java 17+ và Maven.
```bash
cd backend
mvn spring-boot:run
```
- API chạy tại: `http://localhost:8080`
- Bảng điều khiển H2 Console (tùy chọn): `http://localhost:8080/h2-console`
- Kiểm thử toàn bộ Unit & Integration Test: `mvn test`

### 2. Khởi động Frontend (Next.js PWA)
Yêu cầu: Node.js 18+.
```bash
cd frontend
npm install
npm run dev
```
- Truy cập ứng dụng: `http://localhost:3000`

---

## 🌐 Hướng Dẫn Triển Khai (Deploy lên Vercel & Railway / Render)

### 1. Triển khai Frontend lên VERCEL (1-Click)
1. Đẩy mã nguồn dự án lên GitHub.
2. Truy cập [Vercel Dashboard](https://vercel.com) $\rightarrow$ **Add New Project** $\rightarrow$ Chọn Repository của bạn.
3. Trong mục **Root Directory**, bấm Edit và chọn thư mục `frontend`.
4. Cấu hình biến môi trường (Environment Variables):
   - `NEXT_PUBLIC_BACKEND_URL`: URL Backend của bạn (ví dụ: `https://macrotrack-api.up.railway.app`).
5. Bấm **Deploy**. Ứng dụng sẽ có CDN toàn cầu, chứng chỉ HTTPS tự động và hỗ trợ PWA 100%!

### 2. Triển khai Backend lên RAILWAY hoặc RENDER
Backend Spring Boot đã được chuẩn hóa sẵn `Dockerfile` đa giai đoạn:
1. Tạo một Service mới trên [Railway.app](https://railway.app) hoặc [Render.com](https://render.com) từ repo GitHub.
2. Đặt **Root Directory** là `backend`.
3. Railway/Render sẽ tự động phát hiện `Dockerfile` và đóng gói thành container chạy liên tục 24/7 (Cold start = 0ms).
4. Cung cấp biến môi trường (nếu muốn kết nối PostgreSQL đám mây như Neon.tech hoặc Supabase):
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<host>:5432/<dbname>`
   - `SPRING_DATASOURCE_USERNAME`: `<username>`
   - `SPRING_DATASOURCE_PASSWORD`: `<password>`
   *(Nếu không cung cấp biến môi trường DB, hệ thống sẽ tự động dùng database H2 nhúng lưu file không cần cài đặt gì thêm)*.

---

## 📱 Cài Đặt Lên Điện Thoại (PWA Add to Home Screen)

- **Trên iPhone (iOS Safari)**: Mở trang web $\rightarrow$ Bấm nút **Chia sẻ (Share)** ở thanh dưới cùng $\rightarrow$ Chọn **Thêm vào MH chính (Add to Home Screen)**.
- **Trên Android (Chrome)**: Mở trang web $\rightarrow$ Bấm dấu 3 chấm góc phải $\rightarrow$ Chọn **Cài đặt ứng dụng (Install App)**.
- Ứng dụng sẽ mở ở chế độ toàn màn hình (Standalone) không viền trình duyệt, lưu cache mượt mà như app tải từ App Store!
