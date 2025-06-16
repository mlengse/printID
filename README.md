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

## Cara Penggunaan

### Mencetak Label Identitas Pasien

1.  Pastikan Anda berada di halaman registrasi pasien atau halaman detail pasien di sistem j-care yang URL-nya mengandung `/j-care/visits`.
2.  Sebuah tombol "Cetak Label" akan muncul di halaman tersebut.
3.  Klik tombol "Cetak Label" untuk menghasilkan PDF label identitas pasien.
4.  PDF akan ditampilkan dalam iframe tersembunyi dan siap untuk dicetak.

### Mencetak Label Obat

1.  Pastikan Anda berada di halaman rekap pemakaian obat di sistem j-care yang URL-nya mengandung `j-care/healthcenters/rekap_pemakaian_obat`.
2.  Ikon print akan muncul di setiap baris item obat.
3.  Klik ikon print pada baris obat yang diinginkan untuk menghasilkan PDF label obat.
4.  PDF akan ditampilkan dalam iframe tersembunyi dan siap untuk dicetak.

## Kompatibilitas

Ekstensi ini dirancang untuk bekerja dengan sistem j-care pada alamat IP:
*   `http://192.168.100.178/j-care/*`
*   `http://10.12.10.114:800/j-care/*`

Pastikan ekstensi memiliki izin untuk mengakses alamat tersebut.

## Lisensi

Ekstensi ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detailnya.
