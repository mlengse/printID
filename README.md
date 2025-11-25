# Ekstensi Chrome Print ID Pasien

Ekstensi Chrome ini dirancang untuk membantu mencetak label identitas pasien dan label obat dari sistem j-care.

## Fitur

*   Mencetak label identitas pasien dengan informasi yang diambil dari halaman registrasi j-care.
*   Mencetak label obat dengan informasi dari halaman rekap pemakaian obat di j-care.
*   Menggunakan barcode Code 128 untuk Nomor Rekam Medis (RM) pada label.

## Instalasi

1.  Unduh file ekstensi ini (misalnya dalam bentuk file `.zip`) dan ekstrak ke sebuah folder di komputer Anda.
2.  Buka Google Chrome.
3.  Pergi ke `chrome://extensions`.
4.  Aktifkan "Mode Pengembang" (Developer mode) di pojok kanan atas.
5.  Klik "Muat yang belum dibuka" (Load unpacked).
6.  Pilih folder tempat Anda mengekstrak file ekstensi.

## Konfigurasi Ekstensi

Sebelum menggunakan ekstensi, Anda perlu mengaturnya terlebih dahulu:

1.  Klik kanan pada ikon ekstensi di toolbar Chrome.
2.  Pilih "Opsi" (Options). (Jika Anda tidak melihat menu "Opsi", Anda mungkin perlu mengklik ikon "Ekstensi" (puzzle) terlebih dahulu, lalu klik tiga titik di sebelah nama ekstensi ini, kemudian pilih "Opsi".)
3.  Di halaman opsi:
    *   **URL j-care**: Masukkan alamat URL dasar dari sistem j-care Anda (Contoh: `http://192.168.100.178/j-care/`). Pastikan diakhiri dengan `/` dan path yang benar sebelum bagian `/visits` atau `/healthcenters/rekap_pemakaian_obat`.
    *   **Nama Puskesmas**: Masukkan nama Puskesmas yang akan ditampilkan pada label (Contoh: `PKM Jayengan`).
4.  Klik "Simpan".

## Cara Penggunaan

Setelah ekstensi dikonfigurasi dengan benar:

### Mencetak Label Identitas Pasien

1.  Pastikan Anda berada di halaman registrasi pasien atau halaman detail pasien di sistem j-care Anda (URL harus diawali dengan URL j-care yang Anda konfigurasikan dan mengandung path yang biasanya berakhiran `/visits`).
2.  Sebuah tombol "Cetak Label" akan muncul di halaman tersebut jika URL cocok.
3.  Klik tombol "Cetak Label" untuk menghasilkan PDF label identitas pasien.
4.  PDF akan ditampilkan dalam iframe tersembunyi dan siap untuk dicetak.

### Mencetak Label Obat

1.  Pastikan Anda berada di halaman rekap pemakaian obat di sistem j-care Anda (URL harus diawali dengan URL j-care yang Anda konfigurasikan dan mengandung path yang biasanya adalah `/healthcenters/rekap_pemakaian_obat`).
2.  Ikon print akan muncul di setiap baris item obat jika URL cocok.
3.  Klik ikon print pada baris obat yang diinginkan untuk menghasilkan PDF label obat.
4.  PDF akan ditampilkan dalam iframe tersembunyi dan siap untuk dicetak.

## Catatan Penting
*   Pastikan URL j-care yang Anda masukkan di halaman opsi adalah benar dan lengkap agar ekstensi dapat berfungsi. Perhatikan contoh format yang diberikan.
*   Untuk label identitas pasien, nama Puskesmas yang tercetak akan sesuai dengan yang Anda masukkan di halaman opsi. Jika Anda mengalami masalah dimana nama Puskesmas kembali ke nama default ("PKM Default"), coba simpan ulang pengaturan di halaman Opsi dan segarkan halaman j-care.

## Keamanan & Best Practices

### Host Permissions
Ekstensi ini saat ini meminta izin untuk mengakses semua website (`http://*/*` dan `https://*/*`). Untuk keamanan yang lebih baik:

1. **Untuk Pengguna:** Pastikan Anda hanya menggunakan ekstensi ini di sistem j-care internal yang terpercaya.
2. **Untuk Developer:** Sebaiknya ubah `host_permissions` di `manifest.json` untuk hanya mencakup URL spesifik sistem j-care Anda. Contoh:
   ```json
   "host_permissions": [
     "http://192.168.100.178/*",
     "http://localhost:3000/*"
   ]
   ```

### Development
Proyek ini sudah dilengkapi dengan tooling modern:
- **ESLint** untuk static code analysis
- **Prettier** untuk code formatting

Untuk menggunakan:
```bash
npm install
npm run lint        # Check for code issues
npm run lint:fix    # Auto-fix code issues
npm run format      # Format all files
```

## Lisensi

Ekstensi ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detailnya.
