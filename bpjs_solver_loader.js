/**
 * BPJS CAPTCHA Solver Loader
 * Injects ONNX Runtime, solver, and autofill scripts into page context
 */

(function() {
  'use strict';

  console.log('BPJS Solver Loader: Starting...');

  // Inject a script into the page context
  function injectScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        console.log('BPJS Solver Loader: Loaded', url);
        resolve();
      };
      script.onerror = (e) => {
        console.error('BPJS Solver Loader: Failed to load', url, e);
        reject(e);
      };
      (document.head || document.documentElement).appendChild(script);
    });
  }

  // Get extension URL
  function getExtensionUrl(path) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL(path);
    }
    return path;
  }

  // Main loader
  async function loadSolver() {
    try {
      // Inject ONNX Runtime Web
      const ortUrl = getExtensionUrl('ort.min.js');
      console.log('BPJS Solver Loader: Injecting ONNX Runtime from', ortUrl);
      await injectScript(ortUrl);

      // Wait for ort to be available
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if ort is available
      if (typeof window.ort === 'undefined') {
        throw new Error('ONNX Runtime not available after injection');
      }

      console.log('BPJS Solver Loader: ONNX Runtime available');

      // Inject solver script
      const solverUrl = getExtensionUrl('bpjs_captcha_solver.js');
      console.log('BPJS Solver Loader: Injecting solver from', solverUrl);
      await injectScript(solverUrl);

      // Wait for solver to be available
      await new Promise(resolve => setTimeout(resolve, 500));

      if (typeof window.BPJSCaptchaSolver === 'undefined') {
        throw new Error('BPJS Solver not available after injection');
      }

      console.log('BPJS Solver Loader: Solver loaded successfully');

      // Inject autofill script into page context too
      const autofillUrl = getExtensionUrl('bpjs_skrining_autofill_page.js');
      console.log('BPJS Solver Loader: Injecting autofill from', autofillUrl);
      await injectScript(autofillUrl);

      console.log('BPJS Solver Loader: All scripts loaded successfully');

    } catch (error) {
      console.error('BPJS Solver Loader: Failed to load solver', error);
    }
  }

  // Start loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSolver);
  } else {
    loadSolver();
  }
})();

