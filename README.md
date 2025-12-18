# Print ID Extension

Ekstensi Chrome ini dirancang untuk membantu mencetak label identitas pasien dan label obat dari sistem manajemen puskesmas, serta menyediakan fitur **Auto-Fill CAPTCHA** untuk halaman skrining kesehatan.

## Fitur Utama

*   **Cetak Label Identitas Pasien**: Secara otomatis mengambil data pasien (Nama, No RM, Tanggal Lahir, dll.) dari halaman registrasi dan menghasilkan file PDF siap cetak.
*   **Cetak Label Obat**: Mengambil data resep obat dari halaman rekap pemakaian obat dan mencetak label obat dengan informasi lengkap (Nama Pasien, Nama Obat, Aturan Pakai, dll.).
*   **Auto-Fill CAPTCHA**: Mengisi CAPTCHA secara otomatis pada halaman skrining kesehatan menggunakan model CNN-CTC ONNX.
*   **Integrasi Barcode**: Menghasilkan barcode Code-128 untuk Nomor RM pada label identitas.

## Instalasi

1.  Clone repository ini atau download sebagai ZIP dan ekstrak.
2.  Buka Chrome dan navigasi ke `chrome://extensions/`.
3.  Aktifkan "Developer mode" di pojok kanan atas.
4.  Klik "Load unpacked" dan pilih folder hasil ekstrak.
5.  Ekstensi "Print ID" akan muncul di daftar ekstensi.

## Konfigurasi

1.  Klik icon ekstensi di toolbar Chrome, lalu pilih "Options" (atau klik kanan icon > Options).
2.  Di halaman Options:
    *   **URL Sistem**: Masukkan alamat URL dasar dari sistem manajemen Anda (Contoh: `http://ip-server/j-care/`).
    *   **Nama Unit**: Masukkan nama unit/puskesmas yang akan dicetak di header label.
3.  Klik "Simpan Pengaturan".

## Cara Penggunaan

### Cetak Label Identitas
1.  Pastikan Anda berada di halaman registrasi pasien di sistem (path mengandung `/visits`).
2.  Tombol "Cetak Identitas" akan muncul secara otomatis di halaman tersebut (biasanya di dekat tombol aksi lainnya).
3.  Klik tombol "Cetak Identitas".
4.  File PDF akan di-generate dan jendela print dialog browser akan terbuka.
5.  Pilih printer stiker dan cetak.

### Cetak Label Obat
1.  Buka halaman rekap pemakaian obat pasien.
2.  Tombol "Cetak Label Obat" akan muncul untuk setiap item obat.
3.  Klik tombol tersebut untuk mencetak label obat spesifik.

### Skrining Kesehatan Otomatis

Fitur ini membantu mempercepat proses skrining kesehatan dengan mengotomatisasi pengisian data dan CAPTCHA.

1.  Ketika Anda membuka halaman detail pasien yang menampilkan pesan peringatan skrining, ekstensi akan:
    *   Membuka halaman skrining otomatis
    *   Mengambil nomor kartu dari halaman
    *   Melakukan verifikasi data
2.  Di halaman skrining yang terbuka:
    *   Ekstensi akan otomatis mengisi NIK/Nomor Kartu dan Tanggal Lahir.
    *   Ekstensi akan mendeteksi gambar CAPTCHA dan menyelesaikannya secara otomatis.
    *   Tombol "Cari Peserta" akan diklik otomatis.
    *   Jika berhasil, Anda tinggal melanjutkan pengisian formulir skrining.

## Troubleshooting

*   Jika tombol cetak tidak muncul, pastikan URL Sistem yang Anda masukkan di Options sesuai dengan URL yang Anda akses.
*   Pastikan path URL mengandung `/visits` (untuk label identitas) atau `/healthcenters/rekap_pemakaian_obat` (untuk label obat).
*   Jika PDF tidak ter-download atau print dialog tidak muncul, periksa pengaturan pop-up blocker browser Anda.
*   Untuk fitur skrining, pastikan popup blocker tidak menghalangi window baru.

## Development

Semua file JavaScript sudah di-**minify** menggunakan Terser untuk mengurangi ukuran extension (~55% lebih kecil).

*   `background.min.js`: Service worker yang menangani event navigasi dan injection script.
*   `content_script.min.js`: Script utama untuk scraping data dan generate PDF label identitas.
*   `resep.min.js`: Script untuk scraping data dan generate PDF label obat.
*   `health_screening.min.js`: Script untuk deteksi dan verifikasi skrining.
*   `captcha_solver.min.js`: Logic untuk menyelesaikan CAPTCHA menggunakan ONNX Runtime.
*   `manifest.json`: Konfigurasi ekstensi (Manifest V3).

### Build/Minify

Untuk minify ulang file JavaScript setelah development:

```bash
npx terser <file>.js -c -m -o <file>.min.js
```

## Lisensi

MIT
