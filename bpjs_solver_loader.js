/**
 * BPJS CAPTCHA Solver Loader
 * Injects TensorFlow.js, solver, and autofill scripts into page context
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
      // Inject TensorFlow.js
      const tfUrl = getExtensionUrl('tf.min.js');
      console.log('BPJS Solver Loader: Injecting TensorFlow.js from', tfUrl);
      await injectScript(tfUrl);

      // Wait for tf to be available
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if tf is available
      if (typeof window.tf === 'undefined') {
        throw new Error('TensorFlow.js not available after injection');
      }

      console.log('BPJS Solver Loader: TensorFlow.js available, version:', window.tf.version.tfjs);

      // Inject solver script (TensorFlow.js version)
      const solverUrl = getExtensionUrl('bpjs_captcha_solver_tfjs.js');
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

