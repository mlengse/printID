/**
 * BPJS CAPTCHA Solver using ONNX Runtime Web
 * 
 * Two-stage pipeline:
 * 1. bbox_detector.onnx - detects 5 character bounding boxes
 * 2. digit_model_0.onnx - recognizes each character (25 classes)
 */

// BPJS character mapping (25 characters)
const BPJS_CHARS = 'ABCDEHJKMNPRSTUVWXY345689';

// Model configuration
const MODEL_CONFIG = {
  imageWidth: 200,
  imageHeight: 50,
  digitWidth: 28,
  digitHeight: 28,
  numChars: 5,
  numClasses: 25,
  ensembleSize: 3  // Default: use 3 models for ensemble
};

// Global model sessions
let bboxSession = null;
let digitSessions = [];  // Array for ensemble
let isInitialized = false;
let initializationError = null;
let currentSettings = {
  modelPath: '',
  useEnsemble: true
};

/**
 * Initialize ONNX Runtime and load models
 * @param {string} modelBasePath - Base path to model files (optional, uses settings if not provided)
 */
async function initializeSolver(modelBasePath = null) {
  if (isInitialized) {
    console.log('BPJS Solver: Already initialized');
    return true;
  }

  try {
    console.log('BPJS Solver: Initializing ONNX Runtime Web...');
    
    // Check if onnxruntime-web is available
    if (typeof ort === 'undefined') {
      throw new Error('ONNX Runtime Web not loaded. Please include ort.min.js');
    }

    // Load settings from chrome.storage if available
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        const items = await new Promise(resolve => {
          chrome.storage.local.get({ modelPath: '', useEnsemble: true }, resolve);
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
    
    // Load bbox detector model
    const bboxModelPath = basePath + (basePath.endsWith('/') ? '' : '/') + 'bbox_detector.onnx';
    console.log('BPJS Solver: Loading bbox detector...', bboxModelPath);
    bboxSession = await ort.InferenceSession.create(bboxModelPath, {
      executionProviders: ['webgl', 'wasm']
    });
    console.log('BPJS Solver: ✅ Bbox detector loaded');

    // Load digit recognition models (ensemble)
    const numModels = currentSettings.useEnsemble ? MODEL_CONFIG.ensembleSize : 1;
    digitSessions = [];
    
    for (let i = 0; i < numModels; i++) {
      const digitModelPath = basePath + (basePath.endsWith('/') ? '' : '/') + `digit_model_${i}.onnx`;
      console.log(`BPJS Solver: Loading digit model ${i}...`, digitModelPath);
      try {
        const session = await ort.InferenceSession.create(digitModelPath, {
          executionProviders: ['webgl', 'wasm']
        });
        digitSessions.push(session);
        console.log(`BPJS Solver: ✅ Digit model ${i} loaded`);
      } catch (e) {
        console.warn(`BPJS Solver: ⚠️ Could not load digit_model_${i}.onnx:`, e.message);
        if (i === 0) {
          throw new Error('At least digit_model_0.onnx is required');
        }
      }
    }

    if (digitSessions.length === 0) {
      throw new Error('No digit recognition models loaded');
    }

    isInitialized = true;
    initializationError = null;
    console.log(`BPJS Solver: ✅ Initialization complete (${digitSessions.length} digit models loaded)`);
    return true;

  } catch (error) {
    console.error('BPJS Solver: ❌ Initialization failed:', error);
    initializationError = error.message;
    notifyUser('error', `CAPTCHA Solver gagal dimuat: ${error.message}`);
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
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @returns {Float32Array}
 */
function imageToTensor(imageElement, targetWidth, targetHeight) {
  // Create canvas for image processing
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  // Draw and resize image
  ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;

  // Convert to grayscale and normalize [0, 1]
  // NHWC format: [1, height, width, 1]
  const tensorData = new Float32Array(targetHeight * targetWidth);
  
  for (let i = 0; i < targetHeight * targetWidth; i++) {
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
 * Run bounding box detection
 * @param {Float32Array} imageTensor
 * @returns {Float32Array} - 20 values (5 boxes × 4 coords)
 */
async function detectBboxes(imageTensor) {
  if (!bboxSession) {
    throw new Error('Bbox detector not initialized');
  }

  // Create input tensor [1, 50, 200, 1] - NHWC format
  const inputTensor = new ort.Tensor('float32', imageTensor, [1, MODEL_CONFIG.imageHeight, MODEL_CONFIG.imageWidth, 1]);

  // Run inference
  const feeds = {};
  feeds[bboxSession.inputNames[0]] = inputTensor;
  
  const results = await bboxSession.run(feeds);
  const output = results[bboxSession.outputNames[0]];

  return output.data;
}

/**
 * Extract character region from image
 * @param {HTMLImageElement|HTMLCanvasElement} image
 * @param {number} x - normalized x coordinate
 * @param {number} y - normalized y coordinate  
 * @param {number} w - normalized width
 * @param {number} h - normalized height
 * @returns {Float32Array}
 */
function extractCharRegion(image, x, y, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = MODEL_CONFIG.digitWidth;
  canvas.height = MODEL_CONFIG.digitHeight;
  const ctx = canvas.getContext('2d');

  // Denormalize coordinates
  const imgWidth = image.width || image.naturalWidth;
  const imgHeight = image.height || image.naturalHeight;
  
  const sx = Math.max(0, x * imgWidth);
  const sy = Math.max(0, y * imgHeight);
  const sw = Math.min(imgWidth - sx, w * imgWidth);
  const sh = Math.min(imgHeight - sy, h * imgHeight);

  // Draw cropped region
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, MODEL_CONFIG.digitWidth, MODEL_CONFIG.digitHeight);

  // Convert to tensor
  const imageData = ctx.getImageData(0, 0, MODEL_CONFIG.digitWidth, MODEL_CONFIG.digitHeight);
  const data = imageData.data;
  const tensorData = new Float32Array(MODEL_CONFIG.digitHeight * MODEL_CONFIG.digitWidth);

  for (let i = 0; i < tensorData.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    tensorData[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
  }

  return tensorData;
}

/**
 * Recognize single character using ensemble voting
 * @param {Float32Array} charTensor
 * @returns {number} - predicted class index
 */
async function recognizeChar(charTensor) {
  if (digitSessions.length === 0) {
    throw new Error('Digit recognizer not initialized');
  }

  // Create input tensor [1, 28, 28, 1] - NHWC format
  const inputTensor = new ort.Tensor('float32', charTensor, [1, MODEL_CONFIG.digitHeight, MODEL_CONFIG.digitWidth, 1]);

  // Collect votes from all models
  const votes = new Map();
  
  for (let i = 0; i < digitSessions.length; i++) {
    const session = digitSessions[i];
    const feeds = {};
    feeds[session.inputNames[0]] = inputTensor;
    
    const results = await session.run(feeds);
    const output = results[session.outputNames[0]];
    const probs = output.data;

    // Find argmax for this model
    let maxIdx = 0;
    let maxVal = probs[0];
    for (let j = 1; j < probs.length; j++) {
      if (probs[j] > maxVal) {
        maxVal = probs[j];
        maxIdx = j;
      }
    }

    // Add vote
    votes.set(maxIdx, (votes.get(maxIdx) || 0) + 1);
  }

  // Find class with most votes
  let bestClass = 0;
  let maxVotes = 0;
  for (const [classIdx, voteCount] of votes.entries()) {
    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      bestClass = classIdx;
    }
  }

  return bestClass;
}

/**
 * Convert class index to character
 * @param {number} index
 * @returns {string}
 */
function indexToChar(index) {
  if (index >= 0 && index < BPJS_CHARS.length) {
    return BPJS_CHARS[index];
  }
  return '?';
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

  console.log('BPJS Solver: Starting CAPTCHA prediction...');

  try {
    // Step 1: Preprocess image for bbox detection
    const imageTensor = imageToTensor(imageElement, MODEL_CONFIG.imageWidth, MODEL_CONFIG.imageHeight);

    // Step 2: Detect bounding boxes
    console.log('BPJS Solver: Detecting bounding boxes...');
    const bboxes = await detectBboxes(imageTensor);
    
    if (bboxes.length !== MODEL_CONFIG.numChars * 4) {
      throw new Error(`Invalid bbox output: expected ${MODEL_CONFIG.numChars * 4}, got ${bboxes.length}`);
    }

    // Step 3: Extract and recognize each character
    console.log('BPJS Solver: Recognizing characters...');
    let result = '';
    
    for (let i = 0; i < MODEL_CONFIG.numChars; i++) {
      const idx = i * 4;
      const x = bboxes[idx];
      const y = bboxes[idx + 1];
      const w = bboxes[idx + 2];
      const h = bboxes[idx + 3];

      // Extract character region
      const charTensor = extractCharRegion(imageElement, x, y, w, h);

      // Recognize character
      const classIdx = await recognizeChar(charTensor);
      const char = indexToChar(classIdx);
      result += char;

      console.log(`BPJS Solver: Char ${i + 1}: ${char}`);
    }

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
    getEnsembleSize: () => digitSessions.length,
    notifyUser: notifyUser,
    CHARS: BPJS_CHARS
  };
}
