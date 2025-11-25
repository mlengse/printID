# Contributing to Print ID Extension

Terima kasih atas minat Anda untuk berkontribusi pada ekstensi Print ID!

## Development Setup

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```

3. Load extension di Chrome:
   - Buka `chrome://extensions`
   - Enable "Developer mode"
   - Klik "Load unpacked"
   - Pilih folder repository ini

## Code Quality

Proyek ini menggunakan ESLint dan Prettier untuk menjaga kualitas kode.

### Sebelum commit:
```bash
npm run lint:fix    # Fix linting issues
npm run format      # Format code
```

## Code Style Guidelines

- Gunakan `const` dan `let` (hindari `var`)
- Gunakan `===` untuk perbandingan (strict equality)
- Tambahkan error handling untuk semua operasi async
- Gunakan helper functions (`safeQuerySelector`, dll) untuk DOM access
- Hindari menggunakan global variables di window scope

## Security Best Practices

1. **Host Permissions**: Gunakan host permissions yang spesifik, hindari wildcard
2. **Content Scripts**: Gunakan chrome.runtime messaging untuk komunikasi
3. **DOM Access**: Selalu tambahkan null/undefined checks
4. **Error Handling**: Wrap DOM operations dalam try-catch

## Testing

Sebelum submit PR, pastikan:
- [ ] Extension berfungsi untuk semua use cases (patient labels & drug labels)
- [ ] Tidak ada console errors
- [ ] Code sudah di-lint dan di-format
- [ ] README updated jika ada perubahan user-facing

## Pull Request Process

1. Fork repository
2. Buat branch untuk fitur/fix Anda
3. Commit changes dengan descriptive message
4. Push ke fork Anda
5. Buat Pull Request dengan deskripsi yang jelas

## Questions?

Buka issue di GitHub repository untuk pertanyaan atau diskusi.
