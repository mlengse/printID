/**
 * BPJS CAPTCHA Solver using TensorFlow.js
 * 
 * CNN-CTC End-to-End approach:
 * - Uses TensorFlow.js to load Keras model directly
 * - Supports LSTM layers natively (no CudnnRNN issues)
 * - Input: 200×50 grayscale image
 * - Output: 5-character sequence with CTC greedy decoding
 */

// BPJS character mapping (26 characters) - must match training order!
const BPJS_CHARS = '3456789ABCDEHJKMNPRSTUVWXY';
const BLANK_INDEX = 26; // CTC blank token

// Model configuration
const MODEL_CONFIG = {
  imageWidth: 200,
  imageHeight: 50,
  numTimesteps: 50,  // Model outputs 50 timesteps
  numClasses: 27     // 26 chars + 1 blank
};

// Global model reference
let model = null;
let isInitialized = false;
let initializationError = null;
let currentSettings = {
  modelPath: ''
};

/**
 * Initialize TensorFlow.js and load model
 * @param {string} modelBasePath - Base path to model files (optional)
 */
async function initializeSolver(modelBasePath = null) {
  if (isInitialized) {
    console.log('BPJS Solver: Already initialized');
    return true;
  }

  try {
    console.log('BPJS Solver: Initializing TensorFlow.js...');
    
    // Check if TensorFlow.js is available
    if (typeof tf === 'undefined') {
      throw new Error('TensorFlow.js not loaded. Please include tf.min.js');
    }

    console.log('BPJS Solver: TF.js version:', tf.version.tfjs);

    // Load settings from chrome.storage if available
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        const items = await new Promise(resolve => {
          chrome.storage.local.get({ modelPath: '' }, resolve);
        });
        currentSettings = items;
        console.log('BPJS Solver: Settings loaded:', currentSettings);
      } catch (e) {
        console.warn('BPJS Solver: Could not load settings, using defaults');
      }
    }

    // Determine base path for model
    const extensionRoot = window.__BPJS_EXTENSION_URL__ || 
      (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('') : './');
    
    const basePath = modelBasePath || currentSettings.modelPath || (extensionRoot + 'captcha-model/');
    
    console.log('BPJS Solver: Extension root:', extensionRoot);
    console.log('BPJS Solver: Using model path:', basePath);

    // Load TensorFlow.js model (expects model.json + shard files)
    const modelJsonPath = basePath + (basePath.endsWith('/') ? '' : '/') + 'model.json';
    console.log('BPJS Solver: Loading TF.js model...', modelJsonPath);
    
    model = await tf.loadLayersModel(modelJsonPath);
    
    console.log('BPJS Solver: ✅ Model loaded');
    console.log('BPJS Solver: Input shape:', model.inputs[0].shape);
    console.log('BPJS Solver: Output shape:', model.outputs[0].shape);

    // Warm up model with dummy inference
    const dummyInput = tf.zeros([1, MODEL_CONFIG.imageHeight, MODEL_CONFIG.imageWidth, 1]);
    const warmupResult = model.predict(dummyInput);
    warmupResult.dispose();
    dummyInput.dispose();
    console.log('BPJS Solver: ✅ Model warmed up');

    isInitialized = true;
    initializationError = null;
    console.log('BPJS Solver: ✅ Initialization complete (TensorFlow.js)');
    return true;

  } catch (error) {
    console.error('BPJS Solver: ❌ Initialization failed:', error);
    const errorMsg = (error && error.message) ? error.message : String(error);
    initializationError = errorMsg;
    notifyUser('error', 'CAPTCHA Solver gagal dimuat: ' + errorMsg);
    return false;
  }
}

/**
 * Notify user about solver status
 */
function notifyUser(type, message) {
  let notifEl = document.getElementById('bpjs-solver-notification');
  if (!notifEl) {
    notifEl = document.createElement('div');
    notifEl.id = 'bpjs-solver-notification';
    notifEl.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 12px 20px;
      border-radius: 5px;
      z-index: 999999;
      font-family: sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      transition: opacity 0.3s;
    `;
    document.body.appendChild(notifEl);
  }

  if (type === 'error') {
    notifEl.style.backgroundColor = '#f8d7da';
    notifEl.style.color = '#721c24';
    notifEl.style.border = '1px solid #f5c6cb';
  } else if (type === 'success') {
    notifEl.style.backgroundColor = '#d4edda';
    notifEl.style.color = '#155724';
    notifEl.style.border = '1px solid #c3e6cb';
  } else {
    notifEl.style.backgroundColor = '#fff3cd';
    notifEl.style.color = '#856404';
    notifEl.style.border = '1px solid #ffeeba';
  }

  notifEl.textContent = message;
  notifEl.style.display = 'block';
  notifEl.style.opacity = '1';

  if (type !== 'error') {
    setTimeout(() => {
      notifEl.style.opacity = '0';
      setTimeout(() => { notifEl.style.display = 'none'; }, 300);
    }, 5000);
  }
}

/**
 * Convert image element to TensorFlow.js tensor
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement
 * @returns {tf.Tensor4D}
 */
function imageToTensor(imageElement) {
  return tf.tidy(() => {
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    canvas.width = MODEL_CONFIG.imageWidth;
    canvas.height = MODEL_CONFIG.imageHeight;
    const ctx = canvas.getContext('2d');

    // Draw and resize image
    ctx.drawImage(imageElement, 0, 0, MODEL_CONFIG.imageWidth, MODEL_CONFIG.imageHeight);
    
    // Convert to tensor
    let tensor = tf.browser.fromPixels(canvas, 1); // grayscale
    
    // Normalize to [0, 1]
    tensor = tensor.toFloat().div(255.0);
    
    // Add batch dimension: [height, width, 1] -> [1, height, width, 1]
    return tensor.expandDims(0);
  });
}

/**
 * CTC Greedy Decoding
 * @param {Float32Array} logits - Output logits [timesteps, num_classes]
 * @returns {string} - Decoded text
 */
function ctcGreedyDecode(logits) {
  const numTimesteps = MODEL_CONFIG.numTimesteps;
  const numClasses = MODEL_CONFIG.numClasses;
  
  const decoded = [];
  let prevIndex = -1;
  
  for (let t = 0; t < numTimesteps; t++) {
    // Find argmax for this timestep
    let maxIdx = 0;
    let maxVal = logits[t * numClasses];
    
    for (let c = 1; c < numClasses; c++) {
      const val = logits[t * numClasses + c];
      if (val > maxVal) {
        maxVal = val;
        maxIdx = c;
      }
    }
    
    // CTC decoding: skip blanks and repeated chars
    if (maxIdx !== BLANK_INDEX && maxIdx !== prevIndex) {
      decoded.push(maxIdx);
    }
    prevIndex = maxIdx;
  }
  
  // Convert indices to characters
  return decoded.map(idx => {
    if (idx >= 0 && idx < BPJS_CHARS.length) {
      return BPJS_CHARS[idx];
    }
    return '?';
  }).join('');
}

/**
 * Solve CAPTCHA from image element
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement
 * @returns {Promise<string>} - 5-character prediction
 */
async function solveCaptcha(imageElement) {
  if (!isInitialized) {
    throw new Error('Solver not initialized. Call initializeSolver() first.');
  }

  console.log('BPJS Solver: Starting TF.js CAPTCHA prediction...');

  try {
    // Step 1: Preprocess image to tensor
    const inputTensor = imageToTensor(imageElement);

    // Step 2: Run inference
    console.log('BPJS Solver: Running inference...');
    const outputTensor = model.predict(inputTensor);
    
    // Step 3: Get output data
    const logits = await outputTensor.data();
    
    // Step 4: CTC greedy decode
    const result = ctcGreedyDecode(logits);
    
    // Cleanup tensors
    inputTensor.dispose();
    outputTensor.dispose();
    
    console.log('BPJS Solver: ✅ Prediction:', result);
    return result;

  } catch (error) {
    console.error('BPJS Solver: ❌ Prediction failed:', error);
    throw error;
  }
}

/**
 * Solve CAPTCHA from image URL
 * @param {string} imageUrl
 * @returns {Promise<string>}
 */
async function solveCaptchaFromUrl(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const result = await solveCaptcha(img);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

/**
 * Solve CAPTCHA from base64 data
 * @param {string} base64Data - base64 encoded image (with or without data URL prefix)
 * @returns {Promise<string>}
 */
async function solveCaptchaFromBase64(base64Data) {
  let dataUrl = base64Data;
  if (!base64Data.startsWith('data:')) {
    dataUrl = 'data:image/png;base64,' + base64Data;
  }
  return solveCaptchaFromUrl(dataUrl);
}

/**
 * Get memory info (TensorFlow.js specific)
 */
function getMemoryInfo() {
  if (typeof tf !== 'undefined') {
    return tf.memory();
  }
  return null;
}

// Export functions for use in extension
if (typeof window !== 'undefined') {
  window.BPJSCaptchaSolver = {
    initialize: initializeSolver,
    solve: solveCaptcha,
    solveFromUrl: solveCaptchaFromUrl,
    solveFromBase64: solveCaptchaFromBase64,
    isReady: () => isInitialized,
    getError: () => initializationError,
    getMemoryInfo: getMemoryInfo,
    notifyUser: notifyUser,
    CHARS: BPJS_CHARS,
    BLANK_INDEX: BLANK_INDEX
  };
}
