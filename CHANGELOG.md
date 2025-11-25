# Changelog

## [0.3.0] - 2025-11-25

### Added
- **BPJS Skrining Otomatis**: Ekstensi sekarang otomatis mendeteksi pesan skrining kesehatan BPJS dan membuka halaman skrining
  - Auto-detect pesan "Anda belum melakukan skrining kesehatan" di halaman detail BPJS
  - Otomatis mengambil nomor kartu BPJS dari halaman
  - Melakukan verifikasi BPJS melalui API `/j-care/bpjs/apis/verifikasi/noka/`
  - Membuka window baru ke https://webskrining.bpjs-kesehatan.go.id/skrining
  - Auto-fill form skrining dengan NIK dan tanggal lahir dari data verifikasi
  - Loading indicator dengan progress status yang detail
  - Menggunakan chrome.storage untuk cross-domain data sharing
  - Auto-cleanup data setelah digunakan atau setelah 5 menit

### Changed
- Hardcoded "PKM Jayengan" di `content_script.js` diganti dengan `puskesmasName` dari chrome.storage settings
- Improved error handling untuk verifikasi BPJS dengan jQuery AJAX dan fallback ke fetch API

### Technical
- Created `bpjs_skrining.js` - Main script untuk deteksi dan verifikasi BPJS
- Created `bpjs_skrining_autofill.js` - Script untuk auto-fill form skrining di website BPJS
- Updated `background.js` untuk inject scripts di halaman BPJS detail dan skrining
- Menggunakan MutationObserver untuk deteksi dinamis pesan skrining
- Cross-domain data transfer menggunakan chrome.storage.local

## [0.2.0] - 2025-11-25

### Fixed
- Fixed critical bug in `jsLabel2PDF.js` where assignment operators were used instead of comparison operators in conditional statements (`if (units="inches")` → `if (_units === "inches")`)
- Improved error handling in background script with proper catch blocks

### Changed
- **Security Improvement**: Replaced global window variable injection (`window.EXTENSION_PUSKESMAS_NAME`) with secure `chrome.runtime.sendMessage`/`onMessage` pattern
- Updated default Puskesmas name handling to use configurable settings from chrome.storage

### Added
- Added helper functions for safer DOM querying with null checks: `safeQuerySelector`, `safeText`, `safeQuerySelectorAll`
- Added development tooling: ESLint and Prettier configurations
- Added `package.json` with npm scripts for linting and formatting
- Added security best practices section in README
- Added this CHANGELOG file

### Developer Experience
- Created `.eslintrc.json` for code quality enforcement
- Created `.prettierrc.json` for consistent code formatting
- Created `.eslintignore` and `.prettierignore` files
- Added npm scripts: `lint`, `lint:fix`, `format`, `format:check`

## [0.1.0] - Previous releases
- Initial release with basic patient ID and medication label printing functionality
