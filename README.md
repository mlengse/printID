# Ekstensi Chrome Print ID Pasien

Ekstensi Chrome ini dirancang untuk membantu mencetak label identitas pasien dan label obat dari sistem j-care, serta menyediakan fitur **Auto-Fill CAPTCHA** untuk halaman skrining BPJS.

## Fitur

*   Mencetak label identitas pasien dengan informasi yang diambil dari halaman registrasi j-care.
*   Mencetak label obat dengan informasi dari halaman rekap pemakaian obat di j-care.
*   Menggunakan barcode Code 128 untuk Nomor Rekam Medis (RM) pada label.
*   **Auto-Fill CAPTCHA** - Mengisi CAPTCHA secara otomatis pada halaman skrining BPJS menggunakan model CNN-CTC ONNX.

## Instalasi

1.  Unduh file ekstensi ini (misalnya dalam bentuk file `.zip`) dan ekstrak ke sebuah folder di komputer Anda.
2.  Buka Google Chrome.
3.  Pergi ke `chrome://extensions`.
4.  Aktifkan "Mode Pengembang" (Developer mode) di pojok kanan atas.
5.  Klik "Muat yang belum dibuka" (Load unpacked).
6.  Pilih folder tempat Anda mengekstrak file ekstensi.

### Setup CAPTCHA Solver

> [!IMPORTANT]
> File model ONNX tidak disertakan dalam repository. Hubungi admin untuk mendapatkan file model.

Untuk mengaktifkan fitur Auto-Fill CAPTCHA, Anda memerlukan file model:

1.  **Model CAPTCHA** - Hubungi admin untuk mendapatkan:
    - `captcha-model/captcha_ctc.onnx` - Model CNN-CTC
    - `captcha-model/config.json` - Konfigurasi model

2.  Copy file ke folder `captcha-model/` di dalam folder ekstensi.


## Konfigurasi Ekstensi

Sebelum menggunakan ekstensi, Anda perlu mengaturnya terlebih dahulu:

1.  Klik kanan pada ikon ekstensi di toolbar Chrome.
2.  Pilih "Opsi" (Options).
3.  Di halaman opsi:
    *   **URL j-care**: Masukkan alamat URL dasar dari sistem j-care Anda (Contoh: `http://192.168.100.178/j-care/`).
    *   **Nama Puskesmas**: Masukkan nama Puskesmas yang akan ditampilkan pada label.
4.  Klik "Simpan".

## Cara Penggunaan

### Mencetak Label Identitas Pasien

1.  Pastikan Anda berada di halaman registrasi pasien di sistem j-care Anda (path mengandung `/visits`).
2.  Klik tombol "Cetak Label" yang muncul.
3.  PDF label akan siap untuk dicetak.

### Mencetak Label Obat

1.  Pastikan Anda berada di halaman rekap pemakaian obat (`/healthcenters/rekap_pemakaian_obat`).
2.  Klik ikon print pada baris obat yang diinginkan.

### Skrining Kesehatan BPJS Otomatis

1.  Ketika Anda membuka halaman detail BPJS yang menampilkan pesan "Anda belum melakukan skrining kesehatan", ekstensi akan:
    *   Membuka halaman skrining BPJS otomatis
    *   Mengisi NIK dan tanggal lahir
    *   **Mengisi CAPTCHA secara otomatis**
    *   Klik "Cari Peserta" secara otomatis
    *   Klik tombol "Setuju" secara otomatis
2.  Anda tinggal melanjutkan menjawab pertanyaan skrining.

## Catatan Penting

*   Pastikan URL j-care yang Anda masukkan adalah benar dan lengkap.
*   Untuk fitur skrining BPJS, pastikan popup blocker tidak menghalangi window baru.
*   File model CAPTCHA tidak disertakan di repository - **hubungi admin untuk mendapatkan file model**.

## Keamanan & Best Practices

### Host Permissions
Ekstensi ini meminta izin akses luas. Untuk keamanan lebih baik, ubah `host_permissions` di `manifest.json` untuk URL spesifik:
```json
"host_permissions": [
  "http://192.168.100.178/*",
  "https://webskrining.bpjs-kesehatan.go.id/*"
]
```

### Development
```bash
npm install
npm run lint        # Check for code issues
npm run lint:fix    # Auto-fix code issues
npm run format      # Format all files
```

## Mendapatkan File Model

> [!NOTE]
> File model CAPTCHA (`captcha_ctc.onnx`) tidak di-push ke repository GitHub karena ukurannya yang besar (~30MB). 

Untuk mendapatkan file model:
1.  Hubungi admin/developer
2.  Atau train model sendiri menggunakan notebook di folder `trainer/` (jika tersedia)

Struktur folder `captcha-model/` yang diperlukan:
```
captcha-model/
├── captcha_ctc.onnx   # Model ONNX untuk CAPTCHA
└── config.json        # Konfigurasi karakter dan dimensi
```

## Lisensi

Ekstensi ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detailnya.
