# Changelog

All notable changes to this project will be documented in this file.

## [0.4.1] - 2024-12-18

### Changed
- **Minification**: Semua file JavaScript di-minify menggunakan Terser (~55% ukuran lebih kecil).
  - `background.js` → `background.min.js`
  - `content_script.js` → `content_script.min.js`
  - `captcha_solver.js` → `captcha_solver.min.js`
  - `health_screening.js` → `health_screening.min.js`  
  - `health_screening_autofill.js` → `health_screening_autofill.min.js`
  - `resep.js` → `resep.min.js`
  - `jsLabel2PDF.js` → `jsLabel2PDF.min.js`
  - `domHelpers.js` → `domHelpers.min.js`
  - `config.js` → `config.min.js`
  - `options.js` → `options.min.js`
- Updated `manifest.json` dan `options.html` untuk menggunakan file minified.

## [0.4.0] - 2024-05-23

### Changed
- **Configuration**: Introduced `config.js` for managing obfuscated configuration values.

## [0.3.0] - 2024-05-22

### Added
- **CAPTCHA Solver Integration**:
  - Added `captcha_solver.js` using ONNX Runtime Web
  - Implemented CNN-CTC model inference for 5-character CAPTCHA
  - Added `health_screening_autofill.js` for form automation
  - Auto-fill NIK/DoB and auto-solve CAPTCHA on screening page
  - Human-like typing simulation for CAPTCHA input
  - Auto-click "Cari Peserta" and "Setuju" buttons
  - Retry mechanism for failed CAPTCHA attempts

### Changed
- **Skrining Otomatis**: Ekstensi sekarang otomatis mendeteksi pesan skrining kesehatan dan membuka halaman skrining
  - Auto-detect pesan peringatan skrining di halaman detail
  - Otomatis mengambil nomor kartu dari halaman
  - Melakukan verifikasi melalui API internal
  - Membuka window baru ke halaman skrining
  - Pass data (NIK, DoB) to new window via `chrome.storage`

## [0.2.0] - 2024-05-21

### Changed
- Improved error handling untuk verifikasi dengan jQuery AJAX dan fallback ke fetch API
- Added loading indicators

### Added
- Created `health_screening.js` - Main script untuk deteksi dan verifikasi
- Created `health_screening_autofill.js` - Script untuk auto-fill form skrining di website target
- Updated `background.js` untuk inject scripts

## [0.1.0] - 2024-05-20

### Added
- Initial release
- Print Patient ID Label feature
- Print Drug Label feature
