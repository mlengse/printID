// Script untuk auto-fill form skrining BPJS
// Script ini akan diinjeksi ke halaman webskrining.bpjs-kesehatan.go.id

(function() {
  'use strict';

  console.log('BPJS Skrining AutoFill: Script dimuat');

  // Fungsi untuk mengisi form
  function fillForm() {
    // Gunakan chrome.storage untuk mengambil data (cross-domain)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['bpjs-skrining-data'], function(result) {
        const data = result['bpjs-skrining-data'];
        
        if (!data) {
          // console.log('BPJS Skrining AutoFill: Tidak ada data di chrome.storage');
          return;
        }
        
        // console.log('BPJS Skrining AutoFill: Data ditemukan:', data);
        
        // Cek apakah data tidak terlalu lama (max 5 menit)
        if (data.timestamp && (Date.now() - data.timestamp > 5 * 60 * 1000)) {
          // console.log('BPJS Skrining AutoFill: Data sudah kadaluarsa');
          chrome.storage.local.remove('bpjs-skrining-data');
          return;
        }
        
        attemptFillForm(data);
      });
    } else {
      console.error('BPJS Skrining AutoFill: chrome.storage tidak tersedia');
    }
  }
  
  // Fungsi untuk mencoba mengisi form dengan retry
  function attemptFillForm(data) {
    try {
      
      let attemptCount = 0;
      const maxAttempts = 20; // 20 attempts x 500ms = 10 seconds
      
      // Tunggu sampai form elements tersedia
      const checkInterval = setInterval(function() {
        attemptCount++;
        const nikInput = document.querySelector('#nik_txt');
        const tglLahirInput = document.querySelector('#TglLahir_src');
        
        // console.log(`BPJS Skrining AutoFill: Attempt ${attemptCount}/${maxAttempts}`, {
        //   nikInput: !!nikInput,
        //   tglLahirInput: !!tglLahirInput
        // });
        
        if (nikInput && tglLahirInput) {
          clearInterval(checkInterval);
          
          // Isi NIK
          if (data.nik) {
            nikInput.value = data.nik;
            // console.log('BPJS Skrining AutoFill: NIK diisi:', data.nik);
            
            // Trigger berbagai event untuk memastikan form mendeteksi perubahan
            nikInput.dispatchEvent(new Event('input', { bubbles: true }));
            nikInput.dispatchEvent(new Event('change', { bubbles: true }));
            nikInput.dispatchEvent(new Event('blur', { bubbles: true }));
          }
          
          // Isi tanggal lahir
          if (data.tglLahir) {
            tglLahirInput.value = data.tglLahir;
            // console.log('BPJS Skrining AutoFill: Tanggal lahir diisi:', data.tglLahir);
            
            // Trigger berbagai event
            tglLahirInput.dispatchEvent(new Event('input', { bubbles: true }));
            tglLahirInput.dispatchEvent(new Event('change', { bubbles: true }));
            tglLahirInput.dispatchEvent(new Event('blur', { bubbles: true }));
          }
          
          // console.log('BPJS Skrining AutoFill: Form berhasil diisi');
          
          // Hapus data dari chrome.storage setelah digunakan
          if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.remove('bpjs-skrining-data');
          }
        } else if (attemptCount >= maxAttempts) {
          clearInterval(checkInterval);
          console.error('BPJS Skrining AutoFill: Form elements tidak ditemukan setelah 10 detik');
        }
      }, 500); // Check every 500ms
      
    } catch (error) {
      console.error('BPJS Skrining AutoFill: Error:', error);
    }
  }

  // Jalankan saat DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fillForm);
  } else {
    fillForm();
  }

})();
