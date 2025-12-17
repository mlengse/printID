/**
 * BPJS Skrining AutoFill - Page Context Version
 * This script runs in page context (injected by loader) and can access BPJSCaptchaSolver directly
 */

(function() {
  'use strict';

  console.log('BPJS AutoFill (Page): Script dimuat');

  // Check for skrining data passed via global variable
  const skriningData = window.__BPJS_SKRINING_DATA__;
  
  // Fill form with NIK and Tanggal Lahir if data available
  function fillForm() {
    if (!skriningData) {
      console.log('BPJS AutoFill (Page): No skrining data available');
      return;
    }

    console.log('BPJS AutoFill (Page): Data tersedia, mengisi form...');

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
        if (skriningData.nik) {
          nikInput.value = skriningData.nik;
          nikInput.dispatchEvent(new Event('input', { bubbles: true }));
          nikInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('BPJS AutoFill (Page): NIK terisi:', skriningData.nik);
        }

        // Fill Tanggal Lahir
        if (skriningData.tglLahir) {
          tglLahirInput.value = skriningData.tglLahir;
          tglLahirInput.dispatchEvent(new Event('input', { bubbles: true }));
          tglLahirInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('BPJS AutoFill (Page): Tanggal Lahir terisi:', skriningData.tglLahir);
        }

        console.log('BPJS AutoFill (Page): Form berhasil diisi!');

      } else if (attempts >= maxAttempts) {
        clearInterval(checkForm);
        console.error('BPJS AutoFill (Page): Form elements tidak ditemukan');
      }
    }, 500);
  }

  // Direct access to solver in page context
  const solver = window.BPJSCaptchaSolver;

  if (!solver) {
    console.error('BPJS AutoFill (Page): Solver tidak tersedia!');
    // Still try to fill form even without solver
    fillForm();
    return;
  }

  console.log('BPJS AutoFill (Page): Solver tersedia, memulai autofill...');
  
  // Flag to stop solving after success
  let captchaSolved = false;
  let captchaObserver = null;
  
  // Fill form first
  fillForm();

  // Fungsi untuk solve CAPTCHA
  async function solveCaptcha() {
    // Skip if already solved
    if (captchaSolved) {
      console.log('BPJS AutoFill (Page): CAPTCHA already solved, skipping...');
      return;
    }
    console.log('BPJS AutoFill (Page): Mencari CAPTCHA elements...');

    // Wait for elements with retry
    let attempts = 0;
    const maxAttempts = 30;

    const checkCaptcha = setInterval(async () => {
      attempts++;

      const captchaImg = document.querySelector('#AppCaptcha_CaptchaImage');
      const captchaInput = document.querySelector('#captchaCode_txt');

      console.log(`BPJS AutoFill (Page): Attempt ${attempts}/${maxAttempts}`, {
        imgFound: !!captchaImg,
        inputFound: !!captchaInput
      });

      if (captchaImg && captchaInput) {
        clearInterval(checkCaptcha);

        console.log('BPJS AutoFill (Page): CAPTCHA elements ditemukan!');

        try {
          // Initialize solver if needed
          if (!solver.isReady()) {
            console.log('BPJS AutoFill (Page): Initializing solver...');
            const success = await solver.initialize();
            if (!success) {
              console.error('BPJS AutoFill (Page): Gagal initialize solver');
              return;
            }
          }

          // Solve CAPTCHA
          console.log('BPJS AutoFill (Page): Solving CAPTCHA...');
          const prediction = await solver.solve(captchaImg);

          if (prediction && prediction.length === 5) {
            // Simulate human-like typing with full keyboard events
            console.log('BPJS AutoFill (Page): Typing CAPTCHA with keyboard events...');
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
                console.log('BPJS AutoFill (Page): ✅ CAPTCHA solved:', prediction);
                showNotification('success', 'CAPTCHA berhasil di-solve: ' + prediction);
                
                // Wait a bit then simulate Tab + Enter to click button
                setTimeout(() => {
                  const btn = document.querySelector('#btnCariPetugas');
                  if (btn) {
                    console.log('BPJS AutoFill (Page): Focusing button and pressing Enter...');
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
                      console.log('BPJS AutoFill (Page): Observer disconnected');
                    }
                    
                    // Watch for Setuju button
                    watchForSetujuButton();
                  }
                }, 300);
              }
            };
            typeChar();
          } else {
            console.warn('BPJS AutoFill (Page): Invalid prediction:', prediction);
            showNotification('warning', 'CAPTCHA prediction invalid');
          }

        } catch (error) {
          console.error('BPJS AutoFill (Page): Error solving CAPTCHA:', error);
          showNotification('error', 'Error: ' + error.message);
        }

      } else if (attempts >= maxAttempts) {
        clearInterval(checkCaptcha);
        console.log('BPJS AutoFill (Page): CAPTCHA elements tidak ditemukan setelah 15 detik');
      }
    }, 500);
  }

  // Show notification
  function showNotification(type, message) {
    let notif = document.getElementById('bpjs-solver-notif');
    if (!notif) {
      notif = document.createElement('div');
      notif.id = 'bpjs-solver-notif';
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

  // Function to watch for and click Setuju button
  function watchForSetujuButton() {
    console.log('BPJS AutoFill (Page): Watching for Setuju button...');
    
    const checkSetuju = setInterval(() => {
      // Look for button with text containing 'Setuju' or 'setuju'
      const buttons = document.querySelectorAll('button, input[type="button"], a.btn');
      for (const btn of buttons) {
        const text = btn.textContent || btn.value || '';
        if (text.toLowerCase().includes('setuju')) {
          console.log('BPJS AutoFill (Page): Found Setuju button:', text);
          clearInterval(checkSetuju);
          
          // Click with delay
          setTimeout(() => {
            btn.focus();
            btn.click();
            showNotification('success', 'Klik Setuju...');
            console.log('BPJS AutoFill (Page): Clicked Setuju button');
          }, 500);
          return;
        }
      }
    }, 500);
    
    // Stop checking after 30 seconds
    setTimeout(() => clearInterval(checkSetuju), 30000);
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
            console.log('BPJS AutoFill (Page): New CAPTCHA detected');
            setTimeout(solveCaptcha, 500);
            return;
          }
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

})();
