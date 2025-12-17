/**
 * Health Screening AutoFill - Page Context Version
 * This script runs in page context (injected by loader) and can access CaptchaSolver directly
 */

(function() {
  'use strict';

  console.log('AutoFill (Page): Script dimuat');

  // Check for screening data passed via global variable
  const screeningData = window.__HEALTH_SCREENING_DATA__;
  
  // Fill form with NIK and Tanggal Lahir if data available
  function fillForm() {
    if (!screeningData) {
      console.log('AutoFill (Page): No data available');
      return;
    }

    console.log('AutoFill (Page): Data tersedia, mengisi form...');

    // Wait for form elements
    let attempts = 0;
    const maxAttempts = 20;

    const checkForm = setInterval(() => {
      attempts++;
      const nikInput = document.querySelector('#nik_txt');
      const tglLahirInput = document.querySelector('#TglLahir_src');

      if (nikInput && tglLahirInput) {
        clearInterval(checkForm);

        // Fill NIK
        if (screeningData.nik) {
          nikInput.value = screeningData.nik;
          nikInput.dispatchEvent(new Event('input', { bubbles: true }));
          nikInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('AutoFill (Page): NIK terisi');
        }

        // Fill Tanggal Lahir
        if (screeningData.tglLahir) {
          tglLahirInput.value = screeningData.tglLahir;
          tglLahirInput.dispatchEvent(new Event('input', { bubbles: true }));
          tglLahirInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('AutoFill (Page): Tanggal Lahir terisi');
        }

        console.log('AutoFill (Page): Form berhasil diisi!');

      } else if (attempts >= maxAttempts) {
        clearInterval(checkForm);
        console.error('AutoFill (Page): Form elements tidak ditemukan');
      }
    }, 500);
  }

  // Direct access to solver in page context
  const solver = window.CaptchaSolver;

  if (!solver) {
    console.error('AutoFill (Page): Solver tidak tersedia!');
    // Still try to fill form even without solver
    fillForm();
    return;
  }

  console.log('AutoFill (Page): Solver tersedia, memulai autofill...');
  
  // Flag to stop solving after success
  let captchaSolved = false;
  let captchaObserver = null;
  
  // Fill form first
  fillForm();

  // Fungsi untuk solve CAPTCHA
  async function solveCaptcha() {
    // Skip if already solved
    if (captchaSolved) {
      console.log('AutoFill (Page): CAPTCHA already solved, skipping...');
      return;
    }
    console.log('AutoFill (Page): Mencari CAPTCHA elements...');

    // Wait for elements with retry
    let attempts = 0;
    const maxAttempts = 30;

    const checkCaptcha = setInterval(async () => {
      attempts++;

      const captchaImg = document.querySelector('#AppCaptcha_CaptchaImage');
      const captchaInput = document.querySelector('#captchaCode_txt');

      console.log(`AutoFill (Page): Attempt ${attempts}/${maxAttempts}`, {
        imgFound: !!captchaImg,
        inputFound: !!captchaInput
      });

      if (captchaImg && captchaInput) {
        clearInterval(checkCaptcha);

        console.log('AutoFill (Page): CAPTCHA elements ditemukan!');

        try {
          // Initialize solver if needed
          if (!solver.isReady()) {
            console.log('AutoFill (Page): Initializing solver...');
            const success = await solver.initialize();
            if (!success) {
              console.error('AutoFill (Page): Gagal initialize solver');
              return;
            }
          }

          // Solve CAPTCHA
          console.log('AutoFill (Page): Solving CAPTCHA...');
          const prediction = await solver.solve(captchaImg);

          if (prediction && prediction.length === 5) {
            // Simulate human-like typing with full keyboard events
            console.log('AutoFill (Page): Typing CAPTCHA with keyboard events...');
            captchaInput.focus();
            captchaInput.value = '';
            
            let charIndex = 0;
            const typeChar = () => {
              if (charIndex < prediction.length) {
                const char = prediction[charIndex];
                const keyCode = char.charCodeAt(0);
                
                // Dispatch keydown
                captchaInput.dispatchEvent(new KeyboardEvent('keydown', {
                  key: char,
                  code: 'Key' + char.toUpperCase(),
                  keyCode: keyCode,
                  which: keyCode,
                  bubbles: true
                }));
                
                // Dispatch keypress
                captchaInput.dispatchEvent(new KeyboardEvent('keypress', {
                  key: char,
                  code: 'Key' + char.toUpperCase(),
                  keyCode: keyCode,
                  which: keyCode,
                  charCode: keyCode,
                  bubbles: true
                }));
                
                // Update value
                captchaInput.value += char;
                
                // Dispatch input event
                captchaInput.dispatchEvent(new InputEvent('input', {
                  inputType: 'insertText',
                  data: char,
                  bubbles: true
                }));
                
                // Dispatch keyup
                captchaInput.dispatchEvent(new KeyboardEvent('keyup', {
                  key: char,
                  code: 'Key' + char.toUpperCase(),
                  keyCode: keyCode,
                  which: keyCode,
                  bubbles: true
                }));
                
                charIndex++;
                // Random delay between 80-200ms to mimic human typing
                setTimeout(typeChar, 80 + Math.random() * 120);
              } else {
                // Done typing - dispatch change
                captchaInput.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('AutoFill (Page): ✅ CAPTCHA solved:', prediction);
                showNotification('success', 'CAPTCHA berhasil di-solve: ' + prediction);
                
                // Wait a bit then simulate Tab + Enter to click button
                setTimeout(() => {
                  const btn = document.querySelector('#btnCariPetugas');
                  if (btn) {
                    console.log('AutoFill (Page): Focusing button and pressing Enter...');
                    btn.focus();
                    
                    // Simulate Enter keydown on button
                    btn.dispatchEvent(new KeyboardEvent('keydown', {
                      key: 'Enter',
                      code: 'Enter',
                      keyCode: 13,
                      which: 13,
                      bubbles: true
                    }));
                    
                    // Simulate Enter keyup
                    btn.dispatchEvent(new KeyboardEvent('keyup', {
                      key: 'Enter',
                      code: 'Enter',
                      keyCode: 13,
                      which: 13,
                      bubbles: true
                    }));
                    
                    // Also trigger click event 
                    btn.click();
                    showNotification('info', 'Mencari peserta...');
                    
                    // Mark as solved and stop observer
                    captchaSolved = true;
                    if (captchaObserver) {
                      captchaObserver.disconnect();
                      console.log('AutoFill (Page): Observer disconnected');
                    }
                    
                    // Watch for Setuju button
                    watchForSetujuButton();
                  }
                }, 300);
              }
            };
            typeChar();
          } else {
            console.warn('AutoFill (Page): Invalid prediction:', prediction);
            showNotification('warning', 'CAPTCHA prediction invalid');
          }

        } catch (error) {
          console.error('AutoFill (Page): Error solving CAPTCHA:', error);
          showNotification('error', 'Error: ' + error.message);
        }

      } else if (attempts >= maxAttempts) {
        clearInterval(checkCaptcha);
        console.log('AutoFill (Page): CAPTCHA elements tidak ditemukan setelah 15 detik');
      }
    }, 500);
  }

  // Show notification
  function showNotification(type, message) {
    let notif = document.getElementById('solver-notif');
    if (!notif) {
      notif = document.createElement('div');
      notif.id = 'solver-notif';
      notif.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 999999;
        font-family: sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(notif);
    }

    if (type === 'success') {
      notif.style.backgroundColor = '#d4edda';
      notif.style.color = '#155724';
    } else if (type === 'error') {
      notif.style.backgroundColor = '#f8d7da';
      notif.style.color = '#721c24';
    } else {
      notif.style.backgroundColor = '#fff3cd';
      notif.style.color = '#856404';
    }

    notif.textContent = message;
    notif.style.display = 'block';

    setTimeout(() => {
      notif.style.display = 'none';
    }, 5000);
  }

  // Function to watch for and click Setuju button OR handle error modal
  function watchForSetujuButton() {
    console.log('AutoFill (Page): Watching for Setuju button or error modal...');
    
    const checkInterval = setInterval(() => {
      // Check for Setuju button
      const buttons = document.querySelectorAll('button, input[type="button"], a.btn');
      for (const btn of buttons) {
        const text = btn.textContent || btn.value || '';
        if (text.toLowerCase().includes('setuju')) {
          console.log('AutoFill (Page): Found Setuju button:', text);
          clearInterval(checkInterval);
          
          // Click with delay
          setTimeout(() => {
            btn.focus();
            btn.click();
            showNotification('success', 'Klik Setuju...');
            console.log('AutoFill (Page): Clicked Setuju button');
          }, 500);
          return;
        }
      }
      
      // Check for error modal (captcha salah)
      // Look for modal containing "captcha" and "salah" text
      const modals = document.querySelectorAll('.modal, .swal2-container, [role="dialog"], .bootbox');
      for (const modal of modals) {
        const modalText = modal.textContent || '';
        if (modalText.toLowerCase().includes('captcha') && 
            (modalText.toLowerCase().includes('salah') || modalText.toLowerCase().includes('wrong'))) {
          console.log('AutoFill (Page): Error modal detected - CAPTCHA salah');
          clearInterval(checkInterval);
          
          // Find and click OK button in modal
          const okButtons = modal.querySelectorAll('button, input[type="button"], .btn');
          for (const okBtn of okButtons) {
            const btnText = okBtn.textContent || okBtn.value || '';
            if (btnText.toLowerCase().includes('ok') || 
                btnText.toLowerCase().includes('tutup') ||
                btnText.toLowerCase().includes('close')) {
              console.log('AutoFill (Page): Clicking OK button...');
              okBtn.click();
              break;
            }
          }
          
          showNotification('warning', 'CAPTCHA salah, mencoba lagi...');
          
          // Wait for modal to close, then retry
          setTimeout(() => {
            // Reset state and re-enable observer
            captchaSolved = false;
            
            if (captchaObserver) {
              captchaObserver.observe(document.body, { childList: true, subtree: true });
              console.log('AutoFill (Page): Observer re-enabled');
            }
            
            // Try solving again
            solveCaptcha();
          }, 1000);
          return;
        }
      }
      
      // Also check for SweetAlert2 or other alert dialogs
      const swalTitle = document.querySelector('.swal2-title, .bootbox-body, .modal-body');
      if (swalTitle) {
        const titleText = swalTitle.textContent || '';
        if (titleText.toLowerCase().includes('captcha') && 
            (titleText.toLowerCase().includes('salah') || titleText.toLowerCase().includes('wrong'))) {
          console.log('AutoFill (Page): SweetAlert error detected');
          clearInterval(checkInterval);
          
          // Click confirm button
          const confirmBtn = document.querySelector('.swal2-confirm, .bootbox-accept, .btn-primary');
          if (confirmBtn) {
            confirmBtn.click();
          }
          
          showNotification('warning', 'CAPTCHA salah, mencoba lagi...');
          
          setTimeout(() => {
            captchaSolved = false;
            if (captchaObserver) {
              captchaObserver.observe(document.body, { childList: true, subtree: true });
            }
            solveCaptcha();
          }, 1000);
          return;
        }
      }
    }, 500);
    
    // Safety timeout after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log('AutoFill (Page): Timeout waiting for response');
    }, 30000);
  }

  // Start solving
  solveCaptcha();

  // Also observe for CAPTCHA refresh (only if not solved)
  captchaObserver = new MutationObserver((mutations) => {
    if (captchaSolved) return;
    
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.id === 'AppCaptcha_CaptchaImage' || 
              node.querySelector?.('#AppCaptcha_CaptchaImage')) {
            console.log('AutoFill (Page): New CAPTCHA detected');
            setTimeout(solveCaptcha, 500);
            return;
          }
        }
      }
    }
  });

  captchaObserver.observe(document.body, { childList: true, subtree: true });

})();
