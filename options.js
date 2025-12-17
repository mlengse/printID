// Saves options to chrome.storage.local.
function save_options() {
  const systemUrlInput = safeGetById('systemUrl');
  const puskesmasNameInput = safeGetById('puskesmasName');
  const modelPathInput = safeGetById('modelPath');
  
  if (!systemUrlInput || !puskesmasNameInput) {
    console.error('[options.js] Required input elements not found');
    return;
  }

  const settings = {
    systemUrl: systemUrlInput.value,
    puskesmasName: puskesmasNameInput.value,
    modelPath: modelPathInput ? modelPathInput.value : ''
  };

  chrome.storage.local.set(settings, function() {
    // Update status to let user know options were saved.
    const status = safeGetById('status');
    if (status) {
      status.textContent = '✅ Pengaturan disimpan.';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    }
  });
}

// Restores options using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({
    systemUrl: '',
    puskesmasName: '',
    modelPath: ''
  }, function(items) {
    const systemUrlInput = safeGetById('systemUrl');
    const puskesmasNameInput = safeGetById('puskesmasName');
    const modelPathInput = safeGetById('modelPath');
    
    if (systemUrlInput) systemUrlInput.value = items.systemUrl;
    if (puskesmasNameInput) puskesmasNameInput.value = items.puskesmasName;
    if (modelPathInput) modelPathInput.value = items.modelPath;
  });
}

// Test model availability - now uses single CTC model
async function testModels() {
  const modelStatus = safeGetById('modelStatus');
  const modelPathInput = safeGetById('modelPath');
  
  if (!modelStatus) return;

  modelStatus.style.display = 'block';
  modelStatus.className = 'model-status warning';
  modelStatus.innerHTML = '⏳ Memeriksa model...';

  const basePath = modelPathInput?.value || chrome.runtime.getURL('captcha-model/');
  
  // Single CTC model architecture
  const requiredModels = ['captcha_ctc.onnx'];

  const results = [];
  let allFound = true;

  for (const model of requiredModels) {
    const modelUrl = basePath.endsWith('/') ? basePath + model : basePath + '/' + model;
    try {
      const response = await fetch(modelUrl, { method: 'HEAD' });
      if (response.ok) {
        results.push(`✅ ${model}`);
      } else {
        results.push(`❌ ${model} (HTTP ${response.status})`);
        allFound = false;
      }
    } catch (error) {
      results.push(`❌ ${model} (${error.message})`);
      allFound = false;
    }
  }

  // Also check config.json
  const configUrl = basePath.endsWith('/') ? basePath + 'config.json' : basePath + '/config.json';
  try {
    const response = await fetch(configUrl);
    if (response.ok) {
      const config = await response.json();
      results.push(`✅ config.json (${config.chars?.length || '?'} chars)`);
    } else {
      results.push(`⚠️ config.json (tidak ditemukan, akan gunakan default)`);
    }
  } catch (error) {
    results.push(`⚠️ config.json (${error.message})`);
  }

  if (allFound) {
    modelStatus.className = 'model-status success';
    modelStatus.innerHTML = `<strong>✅ Model tersedia!</strong><br>${results.join('<br>')}<br><br>
      <small>Model type: CNN-CTC End-to-End (Conv1D, no LSTM)</small>`;
  } else {
    modelStatus.className = 'model-status error';
    modelStatus.innerHTML = `<strong>⚠️ Model tidak ditemukan:</strong><br>${results.join('<br>')}<br><br>
      <small>Pastikan file captcha_ctc.onnx sudah di-copy ke folder captcha-model/</small>`;
  }
}

document.addEventListener('DOMContentLoaded', restore_options);

const saveBtn = safeGetById('save');
if (saveBtn) {
  saveBtn.addEventListener('click', save_options);
} else {
  // Wait for DOM and try again
  document.addEventListener('DOMContentLoaded', () => {
    const btn = safeGetById('save');
    if (btn) btn.addEventListener('click', save_options);
  });
}

const testBtn = safeGetById('testModels');
if (testBtn) {
  testBtn.addEventListener('click', testModels);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = safeGetById('testModels');
    if (btn) btn.addEventListener('click', testModels);
  });
}
