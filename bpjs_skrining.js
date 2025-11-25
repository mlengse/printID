// Script untuk mendeteksi pesan skrining kesehatan BPJS dan membuka iframe skrining

(function() {
  'use strict';

  // Fungsi untuk mendapatkan nomor BPJS dari halaman
  function getNoBPJS() {
    // Metode 1: Cari langsung dengan class nokartu
    const nokartuSpan = document.querySelector('span.nokartu');
    if (nokartuSpan) {
      const noBPJS = nokartuSpan.textContent.trim().replace(/\s/g, '').replace(/&nbsp;/g, '');
      if (noBPJS) {
        console.log('Nomor BPJS ditemukan (class nokartu):', noBPJS);
        return noBPJS;
      }
    }
    
    // Metode 2: Cari di input-static yang labelnya "No. Kartu" atau "No Kartu"
    const inputStatics = document.querySelectorAll('.input-static');
    for (const inputStatic of inputStatics) {
      const label = inputStatic.querySelector('label');
      if (label) {
        const labelText = label.textContent.trim();
        if (labelText === 'No. Kartu' || labelText === 'No Kartu') {
          const span = inputStatic.querySelector('span');
          if (span) {
            const noBPJS = span.textContent.trim().replace(/\s/g, '').replace(/&nbsp;/g, '');
            if (noBPJS) {
              console.log('Nomor BPJS ditemukan (label No. Kartu):', noBPJS);
              return noBPJS;
            }
          }
        }
      }
    }
    
    console.error('Nomor BPJS tidak ditemukan dengan semua metode');
    console.log('Mencari span.nokartu:', document.querySelector('span.nokartu'));
    return null;
  }

  // Fungsi untuk format tanggal ke DD-MM-YYYY
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Fungsi untuk melakukan verifikasi BPJS
  async function verifikasiBPJS(noBPJS) {
    try {
      const today = formatDate(new Date());
      const apiUrl = `/j-care/bpjs/apis/verifikasi/noka/${noBPJS}/${today}/001`;
      
      console.log('Melakukan verifikasi BPJS:', apiUrl);
      
      // Gunakan jQuery jika tersedia, karena server mungkin butuh header khusus dari jQuery
      if (typeof $ !== 'undefined' && $.getJSON) {
        return new Promise((resolve, reject) => {
          $.getJSON(apiUrl, function(data) {
            console.log('Data verifikasi BPJS:', data);
            resolve(data);
          }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error verifikasi BPJS (jQuery):', textStatus, errorThrown);
            reject(new Error(textStatus));
          });
        });
      } else {
        // Fallback ke fetch API
        const response = await fetch(apiUrl, {
          method: 'GET',
          credentials: 'same-origin',
          redirect: 'follow',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data verifikasi BPJS:', data);
        
        return data;
      }
    } catch (error) {
      console.error('Error verifikasi BPJS:', error);
      return null;
    }
  }

  // Fungsi untuk memeriksa apakah element mengandung pesan skrining
  function checkForSkriningMessage() {
    const detailContainer = document.querySelector('.detail-container');
    
    if (!detailContainer) {
      return false;
    }

    const containerText = detailContainer.textContent || detailContainer.innerText;
    const skriningMessage = 'Anda belum melakukan skrining kesehatan. Mohon untuk melakukan skrining kesehatan terlebih dahulu pada menu Skrining Kesehatan.';
    
    return containerText.includes(skriningMessage);
  }

  // Fungsi untuk membuat loading indicator
  function createLoadingIndicator() {
    // Cek apakah sudah ada loading indicator
    let existingLoader = document.getElementById('bpjs-skrining-loader');
    if (existingLoader) {
      return existingLoader;
    }

    // Buat overlay
    const overlay = document.createElement('div');
    overlay.id = 'bpjs-skrining-loader';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    `;

    // Buat spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      border: 8px solid #f3f3f3;
      border-top: 8px solid #007bff;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
    `;

    // Buat text
    const text = document.createElement('div');
    text.id = 'bpjs-skrining-loader-text';
    text.textContent = 'Memuat data BPJS...';
    text.style.cssText = `
      color: white;
      font-size: 16px;
      margin-top: 20px;
      font-family: Arial, sans-serif;
      font-weight: bold;
    `;

    // Tambahkan CSS animation untuk spinner
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    overlay.appendChild(spinner);
    overlay.appendChild(text);
    document.body.appendChild(overlay);

    return overlay;
  }

  // Fungsi untuk update text loading indicator
  function updateLoadingText(text) {
    const loaderText = document.getElementById('bpjs-skrining-loader-text');
    if (loaderText) {
      loaderText.textContent = text;
    }
  }

  // Fungsi untuk menghapus loading indicator
  function removeLoadingIndicator() {
    const loader = document.getElementById('bpjs-skrining-loader');
    if (loader) {
      loader.remove();
    }
  }

  // Fungsi untuk membuka skrining di window baru
  async function openSkriningWindow() {
    // Tampilkan loading indicator
    createLoadingIndicator();
    updateLoadingText('Mengambil nomor BPJS...');
    
    // Dapatkan nomor BPJS
    const noBPJS = getNoBPJS();
    if (!noBPJS) {
      console.error('Nomor BPJS tidak ditemukan');
      updateLoadingText('Error: Nomor BPJS tidak ditemukan');
      setTimeout(removeLoadingIndicator, 2000);
      return;
    }
    
    console.log('Nomor BPJS ditemukan:', noBPJS);
    updateLoadingText('Melakukan verifikasi BPJS...');
    
    // Lakukan verifikasi BPJS
    const verifikasiData = await verifikasiBPJS(noBPJS);
    
    if (!verifikasiData) {
      console.error('Gagal mendapatkan data verifikasi BPJS');
      updateLoadingText('Gagal verifikasi BPJS, tetap membuka skrining...');
      // Tetap buka window meskipun gagal verifikasi
    } else {
      updateLoadingText('Verifikasi berhasil, menyimpan data...');
    }
    
    // Simpan data ke chrome.storage untuk digunakan di window skrining (cross-domain)
    if (verifikasiData && typeof chrome !== 'undefined' && chrome.storage) {
      const skriningData = {
        nik: verifikasiData.noKTP || verifikasiData.noKartu,
        tglLahir: verifikasiData.tglLahir,
        nama: verifikasiData.nama,
        timestamp: Date.now()
      };
      chrome.storage.local.set({ 'bpjs-skrining-data': skriningData }, function() {
        console.log('Data skrining disimpan ke chrome.storage:', skriningData);
      });
    }
    
    const skriningUrl = 'https://webskrining.bpjs-kesehatan.go.id/skrining';
    
    updateLoadingText('Membuka halaman skrining...');
    
    // Buka window baru dengan ukuran yang sesuai
    const windowFeatures = 'width=1200,height=800,left=100,top=100,resizable=yes,scrollbars=yes,status=yes';
    const skriningWindow = window.open(skriningUrl, 'BPJSSkrining', windowFeatures);
    
    if (skriningWindow) {
      // Fokus ke window baru
      skriningWindow.focus();
      
      console.log('Window skrining BPJS berhasil dibuka');
      updateLoadingText('Menunggu halaman skrining siap...');
      
      // Hapus loading setelah 3 detik (waktu untuk halaman skrining load)
      setTimeout(function() {
        updateLoadingText('Halaman skrining berhasil dibuka!');
        setTimeout(removeLoadingIndicator, 1000);
      }, 3000);
      
      // Tunggu window selesai load, lalu isi form
      if (verifikasiData) {
        skriningWindow.addEventListener('load', function() {
          fillSkriningForm(skriningWindow, verifikasiData);
        });
      }
    } else {
      // Jika popup diblokir, coba buka di tab baru
      console.warn('Popup mungkin diblokir, mencoba membuka di tab baru...');
      updateLoadingText('Popup diblokir, membuka tab baru...');
      
      const newTab = window.open(skriningUrl, '_blank');
      
      if (newTab) {
        newTab.focus();
        console.log('Tab skrining BPJS berhasil dibuka');
        updateLoadingText('Tab skrining berhasil dibuka!');
        setTimeout(removeLoadingIndicator, 2000);
      } else {
        console.error('Gagal membuka window/tab skrining. Popup mungkin diblokir oleh browser.');
        updateLoadingText('Error: Gagal membuka skrining. Popup diblokir!');
        setTimeout(removeLoadingIndicator, 3000);
      }
    }
  }
  
  // Fungsi untuk mengisi form skrining (tidak akan berfungsi karena cross-origin)
  // Data akan diambil dari sessionStorage di window skrining
  function fillSkriningForm(targetWindow, data) {
    try {
      const nikInput = targetWindow.document.querySelector('#nik_txt');
      const tglLahirInput = targetWindow.document.querySelector('#TglLahir_src');
      
      if (nikInput && data.noKTP) {
        nikInput.value = data.noKTP;
      } else if (nikInput && data.noKartu) {
        nikInput.value = data.noKartu;
      }
      
      if (tglLahirInput && data.tglLahir) {
        tglLahirInput.value = data.tglLahir;
      }
      
      console.log('Form skrining berhasil diisi');
    } catch (error) {
      console.error('Tidak dapat mengisi form karena cross-origin restriction:', error);
      console.log('Data tersimpan di localStorage dengan key "bpjs-skrining-data"');
    }
  }

  // Tunggu sampai DOM siap
  function init() {
    // Gunakan MutationObserver untuk mendeteksi perubahan pada .detail-container
    const observer = new MutationObserver(function(mutations) {
      if (checkForSkriningMessage()) {
        openSkriningWindow();
        // Hentikan observer setelah window dibuka
        observer.disconnect();
      }
    });

    // Cek segera saat script dijalankan
    if (checkForSkriningMessage()) {
      openSkriningWindow();
    } else {
      // Jika belum ada, tunggu perubahan DOM
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout setelah 10 detik
      setTimeout(function() {
        observer.disconnect();
      }, 10000);
    }
  }

  // Jalankan saat DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
