/**
 * BPJS CAPTCHA Solver using ONNX Runtime Web
 * 
 * CNN-CTC End-to-End approach:
 * - Single model: captcha_ctc.onnx
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

// Global model session
let ctcSession = null;
let isInitialized = false;
let initializationError = null;
let currentSettings = {
  modelPath: ''
};

/**
 * Initialize ONNX Runtime and load CTC model
 * @param {string} modelBasePath - Base path to model files (optional, uses settings if not provided)
 */
async function initializeSolver(modelBasePath = null) {
  if (isInitialized) {
    console.log('BPJS Solver: Already initialized');
    return true;
  }

  try {
    console.log('BPJS Solver: Initializing ONNX Runtime Web (CTC mode)...');
    
    // Check if onnxruntime-web is available
    if (typeof ort === 'undefined') {
      throw new Error('ONNX Runtime Web not loaded. Please include ort.min.js');
    }

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

    // Determine base path for models - use injected extension URL if available
    const extensionRoot = window.__BPJS_EXTENSION_URL__ || 
      (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL('') : './');
    
    const basePath = modelBasePath || currentSettings.modelPath || (extensionRoot + 'captcha-model/');
    
    console.log('BPJS Solver: Extension root:', extensionRoot);
    console.log('BPJS Solver: Using model path:', basePath);

    // Configure ONNX Runtime - WASM files are in extension root
    ort.env.wasm.wasmPaths = extensionRoot;
    
    // Disable SIMD and threading to avoid ES module import issues in Chrome extension
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = false;
    
    // Load CTC model
    const ctcModelPath = basePath + (basePath.endsWith('/') ? '' : '/') + 'captcha_ctc.onnx';
    console.log('BPJS Solver: Loading CTC model...', ctcModelPath);
    ctcSession = await ort.InferenceSession.create(ctcModelPath, {
      executionProviders: ['wasm']  // Use wasm only, webgl can cause issues
    });
    console.log('BPJS Solver: ✅ CTC model loaded');
    console.log('BPJS Solver: Input names:', ctcSession.inputNames);
    console.log('BPJS Solver: Output names:', ctcSession.outputNames);

    isInitialized = true;
    initializationError = null;
    console.log('BPJS Solver: ✅ Initialization complete (CTC mode)');
    return true;

  } catch (error) {
    console.error('BPJS Solver: ❌ Initialization failed:', error);
    initializationError = (error && error.message) ? error.message : String(error);
    notifyUser('error', 'CAPTCHA Solver gagal dimuat: ' + initializationError);
    return false;
  }
}

/**
 * Notify user about solver status
 */
function notifyUser(type, message) {
  // Create or update notification element
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

  // Auto-hide after 5 seconds for success/warning
  if (type !== 'error') {
    setTimeout(() => {
      notifEl.style.opacity = '0';
      setTimeout(() => { notifEl.style.display = 'none'; }, 300);
    }, 5000);
  }
}

/**
 * Convert image element to grayscale tensor
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement
 * @returns {Float32Array}
 */
function imageToTensor(imageElement) {
  // Create canvas for image processing
  const canvas = document.createElement('canvas');
  canvas.width = MODEL_CONFIG.imageWidth;
  canvas.height = MODEL_CONFIG.imageHeight;
  const ctx = canvas.getContext('2d');

  // Draw and resize image
  ctx.drawImage(imageElement, 0, 0, MODEL_CONFIG.imageWidth, MODEL_CONFIG.imageHeight);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, MODEL_CONFIG.imageWidth, MODEL_CONFIG.imageHeight);
  const data = imageData.data;

  // Convert to grayscale and normalize [0, 1]
  // NHWC format: [1, height, width, 1]
  const tensorData = new Float32Array(MODEL_CONFIG.imageHeight * MODEL_CONFIG.imageWidth);
  
  for (let i = 0; i < MODEL_CONFIG.imageHeight * MODEL_CONFIG.imageWidth; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    // Grayscale conversion
    const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
    tensorData[i] = gray;
  }

  return tensorData;
}

/**
 * CTC Greedy Decoding
 * Removes blanks and repeated characters
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
 * Run CTC model inference
 * @param {Float32Array} imageTensor
 * @returns {string} - Predicted text
 */
async function runCTCInference(imageTensor) {
  if (!ctcSession) {
    throw new Error('CTC model not initialized');
  }

  // Create input tensor [1, 50, 200, 1] - NHWC format
  const inputTensor = new ort.Tensor('float32', imageTensor, 
    [1, MODEL_CONFIG.imageHeight, MODEL_CONFIG.imageWidth, 1]);

  // Run inference
  const feeds = {};
  feeds[ctcSession.inputNames[0]] = inputTensor;
  
  const results = await ctcSession.run(feeds);
  const output = results[ctcSession.outputNames[0]];
  
  // Output shape should be [1, 50, 27] - batch, timesteps, classes
  const logits = output.data;
  
  // Apply CTC greedy decoding
  return ctcGreedyDecode(logits);
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

  console.log('BPJS Solver: Starting CTC CAPTCHA prediction...');

  try {
    // Step 1: Preprocess image
    const imageTensor = imageToTensor(imageElement);

    // Step 2: Run CTC inference with greedy decoding
    console.log('BPJS Solver: Running CTC inference...');
    const result = await runCTCInference(imageTensor);
    
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
  // Ensure proper data URL format
  let dataUrl = base64Data;
  if (!base64Data.startsWith('data:')) {
    dataUrl = 'data:image/png;base64,' + base64Data;
  }
  
  return solveCaptchaFromUrl(dataUrl);
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
    notifyUser: notifyUser,
    CHARS: BPJS_CHARS,
    BLANK_INDEX: BLANK_INDEX
  };
}
