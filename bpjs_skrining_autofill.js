// Script untuk auto-fill form skrining BPJS dengan CAPTCHA solver
// Script ini akan diinjeksi ke halaman webskrining.bpjs-kesehatan.go.id

(function() {
  'use strict';

  console.log('BPJS Skrining AutoFill: Script dimuat');

  // Solver akan di-load secara async oleh loader
  let solverReady = false;

  // Listen for solver ready event from loader
  window.addEventListener('bpjs-solver-ready', () => {
    console.log('BPJS Skrining AutoFill: Solver is ready!');
    solverReady = true;
    // Try to solve CAPTCHA now that solver is ready
    solveCaptchaOnPage();
  });

  window.addEventListener('bpjs-solver-error', (e) => {
    console.error('BPJS Skrining AutoFill: Solver error:', e.detail);
  });

  // Check if solver is already available (in case script loaded late)
  function checkSolverAvailable() {
    return typeof window.BPJSCaptchaSolver !== 'undefined' && window.BPJSCaptchaSolver.isReady();
  }

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
        
        if (nikInput && tglLahirInput) {
          clearInterval(checkInterval);
          
          // Isi NIK
          if (data.nik) {
            nikInput.value = data.nik;
            
            // Trigger berbagai event untuk memastikan form mendeteksi perubahan
            nikInput.dispatchEvent(new Event('input', { bubbles: true }));
            nikInput.dispatchEvent(new Event('change', { bubbles: true }));
            nikInput.dispatchEvent(new Event('blur', { bubbles: true }));
          }
          
          // Isi tanggal lahir
          if (data.tglLahir) {
            tglLahirInput.value = data.tglLahir;
            
            // Trigger berbagai event
            tglLahirInput.dispatchEvent(new Event('input', { bubbles: true }));
            tglLahirInput.dispatchEvent(new Event('change', { bubbles: true }));
            tglLahirInput.dispatchEvent(new Event('blur', { bubbles: true }));
          }
          
          console.log('BPJS Skrining AutoFill: Form berhasil diisi');
          
          // Hapus data dari chrome.storage setelah digunakan
          if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.remove('bpjs-skrining-data');
          }

          // Try to solve CAPTCHA if solver ready
          if (checkSolverAvailable()) {
            solveCaptchaOnPage();
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

  // Fungsi untuk solve CAPTCHA di halaman
  async function solveCaptchaOnPage() {
    console.log('BPJS Skrining AutoFill: Mencari CAPTCHA image...');
    
    // Wait for CAPTCHA elements with more retries
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts x 500ms = 15 seconds
    
    const checkCaptcha = setInterval(async () => {
      attempts++;
      
      // BPJS Skrining CAPTCHA selectors
      const captchaImg = document.querySelector('#AppCaptcha_CaptchaImage');
      
      // Use the correct CAPTCHA input selector
      const captchaInput = document.querySelector('#captchaCode_txt');
      
      if (captchaImg && captchaInput) {
        clearInterval(checkCaptcha);
        
        console.log('BPJS Skrining AutoFill: CAPTCHA elements found');
        
        try {
          // Initialize solver if not ready
          if (!window.BPJSCaptchaSolver.isReady()) {
            console.log('BPJS Skrining AutoFill: Initializing CAPTCHA solver...');
            const modelPath = chrome.runtime.getURL('captcha-model/');
            await window.BPJSCaptchaSolver.initialize(modelPath);
          }
          
          // Solve CAPTCHA
          console.log('BPJS Skrining AutoFill: Solving CAPTCHA...');
          const prediction = await window.BPJSCaptchaSolver.solve(captchaImg);
          
          if (prediction && prediction.length === 5) {
            captchaInput.value = prediction;
            captchaInput.dispatchEvent(new Event('input', { bubbles: true }));
            captchaInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('BPJS Skrining AutoFill: ✅ CAPTCHA solved:', prediction);
          } else {
            console.warn('BPJS Skrining AutoFill: Invalid CAPTCHA prediction:', prediction);
          }
          
        } catch (error) {
          console.error('BPJS Skrining AutoFill: CAPTCHA solving failed:', error);
        }
        
      } else if (attempts >= maxAttempts) {
        clearInterval(checkCaptcha);
        console.log('BPJS Skrining AutoFill: CAPTCHA elements not found (mungkin tidak ada CAPTCHA)');
      }
    }, 500);
  }

  // Also try to solve CAPTCHA on any newly appearing CAPTCHA
  function observeCaptchaChanges() {
    // Observer will work regardless of solver state
    
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const img = node.querySelector?.('img[src*="captcha"]') || 
                       (node.tagName === 'IMG' && node.src?.includes('captcha') ? node : null);
            if (img) {
              console.log('BPJS Skrining AutoFill: New CAPTCHA detected');
              setTimeout(() => solveCaptchaOnPage(), 500);
              return;
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Jalankan saat DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fillForm();
      observeCaptchaChanges();
      // CAPTCHA solving will be triggered by solver-ready event
    });
  } else {
    fillForm();
    observeCaptchaChanges();
    // CAPTCHA solving will be triggered by solver-ready event
  }

})();



