// Script untuk mendeteksi pesan skrining kesehatan dan membuka iframe skrining

(function() {
  'use strict';

  const CONFIG = typeof window.APP_CONFIG !== 'undefined' ? window.APP_CONFIG : {
      SCREENING_URL: '',
      API_VERIF: '',
      MSG_SCREENING: ''
  };

  // Fungsi untuk mendapatkan nomor eksternal dari halaman
  function getExternalId() {
    // Metode 1: Cari langsung dengan class nokartu
    const nokartuSpan = safeQuerySelector('span.nokartu');
    if (nokartuSpan) {
      const extId = nokartuSpan.textContent.trim().replace(/\s/g, '').replace(/&nbsp;/g, '');
      if (extId) {
        return extId;
      }
    }
    
    // Metode 2: Cari di input-static yang labelnya "No. Kartu" atau "No Kartu"
    const inputStatics = safeQuerySelectorAll('.input-static');
    for (const inputStatic of inputStatics) {
      const label = safeQuerySelector('label', inputStatic);
      if (label) {
        const labelText = label.textContent.trim();
        if (labelText === 'No. Kartu' || labelText === 'No Kartu') {
          const span = safeQuerySelector('span', inputStatic);
          if (span) {
            const extId = span.textContent.trim().replace(/\s/g, '').replace(/&nbsp;/g, '');
            if (extId) {
              return extId;
            }
          }
        }
      }
    }
    
    console.error('ID tidak ditemukan dengan semua metode');
    return null;
  }

  // Fungsi untuk format tanggal ke DD-MM-YYYY
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Fungsi untuk melakukan verifikasi layanan
  async function verifyService(extId) {
    try {
      const today = formatDate(new Date());
      const apiUrl = `${CONFIG.API_VERIF}${extId}/${today}/001`;
      
      // Gunakan jQuery jika tersedia, karena server mungkin butuh header khusus dari jQuery
      if (typeof $ !== 'undefined' && $.getJSON) {
        return new Promise((resolve, reject) => {
          $.getJSON(apiUrl, function(data) {
            resolve(data);
          }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error verifikasi (jQuery):', textStatus, errorThrown);
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
        return data;
      }
    } catch (error) {
      console.error('Error verifikasi:', error);
      return null;
    }
  }

  // Fungsi untuk memeriksa apakah element mengandung pesan skrining
  function checkForScreeningMessage() {
    const detailContainer = safeQuerySelector('.detail-container');
    
    if (!detailContainer) {
      return false;
    }

    const containerText = detailContainer.textContent || detailContainer.innerText;
    
    return containerText.includes(CONFIG.MSG_SCREENING);
  }

  // Fungsi untuk membuat loading indicator
  function createLoadingIndicator() {
    // Cek apakah sudah ada loading indicator
    let existingLoader = safeGetById('health-screening-loader');
    if (existingLoader) {
      return existingLoader;
    }

    // Buat overlay
    const overlay = document.createElement('div');
    overlay.id = 'health-screening-loader';
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
    text.id = 'health-screening-loader-text';
    text.textContent = 'Memuat data...';
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
    const loaderText = safeGetById('health-screening-loader-text');
    if (loaderText) {
      loaderText.textContent = text;
    }
  }

  // Fungsi untuk menghapus loading indicator
  function removeLoadingIndicator() {
    const loader = safeGetById('health-screening-loader');
    if (loader) {
      loader.remove();
    }
  }

  // Fungsi untuk membuka skrining di window baru
  async function openScreeningWindow() {
    // Tampilkan loading indicator
    createLoadingIndicator();
    updateLoadingText('Mengambil nomor...');
    
    // Dapatkan nomor ID
    const extId = getExternalId();
    if (!extId) {
      console.error('Nomor tidak ditemukan');
      updateLoadingText('Error: Nomor tidak ditemukan');
      setTimeout(removeLoadingIndicator, 2000);
      return;
    }
    
    updateLoadingText('Melakukan verifikasi...');
    
    // Lakukan verifikasi
    const verifikasiData = await verifyService(extId);
    
    if (!verifikasiData) {
      console.error('Gagal mendapatkan data verifikasi');
      updateLoadingText('Gagal verifikasi, tetap membuka halaman...');
      // Tetap buka window meskipun gagal verifikasi
    } else {
      updateLoadingText('Verifikasi berhasil, menyimpan data...');
    }
    
    // Simpan data ke chrome.storage untuk digunakan di window skrining (cross-domain)
    if (verifikasiData && typeof chrome !== 'undefined' && chrome.storage) {
      const screeningData = {
        nik: verifikasiData.noKTP || verifikasiData.noKartu,
        tglLahir: verifikasiData.tglLahir,
        nama: verifikasiData.nama,
        timestamp: Date.now()
      };
      chrome.storage.local.set({ 'health-screening-data': screeningData }, function() {
        // Data stored
      });
    }
    
    const screeningUrl = CONFIG.SCREENING_URL;
    
    updateLoadingText('Membuka halaman...');
    
    // Buka window baru dengan ukuran yang sesuai
    const windowFeatures = 'width=1200,height=800,left=100,top=100,resizable=yes,scrollbars=yes,status=yes';
    const screeningWindow = window.open(screeningUrl, 'HealthScreening', windowFeatures);
    
    if (screeningWindow) {
      // Fokus ke window baru
      screeningWindow.focus();
      
      updateLoadingText('Menunggu halaman siap...');
      
      // Hapus loading setelah 3 detik
      setTimeout(function() {
        updateLoadingText('Halaman berhasil dibuka!');
        setTimeout(removeLoadingIndicator, 1000);
      }, 3000);
      
    } else {
      // Jika popup diblokir, coba buka di tab baru
      console.warn('Popup mungkin diblokir, mencoba membuka di tab baru...');
      updateLoadingText('Popup diblokir, membuka tab baru...');
      
      const newTab = window.open(screeningUrl, '_blank');
      
      if (newTab) {
        newTab.focus();
        updateLoadingText('Tab berhasil dibuka!');
        setTimeout(removeLoadingIndicator, 2000);
      } else {
        console.error('Gagal membuka window/tab. Popup mungkin diblokir oleh browser.');
        updateLoadingText('Error: Gagal membuka. Popup diblokir!');
        setTimeout(removeLoadingIndicator, 3000);
      }
    }
  }

  // Tunggu sampai DOM siap
  function init() {
    // Gunakan MutationObserver untuk mendeteksi perubahan pada .detail-container
    const observer = new MutationObserver(function(mutations) {
      if (checkForScreeningMessage()) {
        openScreeningWindow();
        // Hentikan observer setelah window dibuka
        observer.disconnect();
      }
    });

    // Cek segera saat script dijalankan
    if (checkForScreeningMessage()) {
      openScreeningWindow();
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
