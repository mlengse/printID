// Saves options to chrome.storage.local.
function save_options() {
  const jcareUrlInput = safeGetById('jcareUrl');
  const puskesmasNameInput = safeGetById('puskesmasName');
  const modelPathInput = safeGetById('modelPath');
  const useEnsembleInput = safeGetById('useEnsemble');
  
  if (!jcareUrlInput || !puskesmasNameInput) {
    console.error('[options.js] Required input elements not found');
    return;
  }

  const settings = {
    jcareUrl: jcareUrlInput.value,
    puskesmasName: puskesmasNameInput.value,
    modelPath: modelPathInput ? modelPathInput.value : '',
    useEnsemble: useEnsembleInput ? useEnsembleInput.checked : true
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
    jcareUrl: '',
    puskesmasName: '',
    modelPath: '',
    useEnsemble: true
  }, function(items) {
    const jcareUrlInput = safeGetById('jcareUrl');
    const puskesmasNameInput = safeGetById('puskesmasName');
    const modelPathInput = safeGetById('modelPath');
    const useEnsembleInput = safeGetById('useEnsemble');
    
    if (jcareUrlInput) jcareUrlInput.value = items.jcareUrl;
    if (puskesmasNameInput) puskesmasNameInput.value = items.puskesmasName;
    if (modelPathInput) modelPathInput.value = items.modelPath;
    if (useEnsembleInput) useEnsembleInput.checked = items.useEnsemble;
  });
}

// Test model availability
async function testModels() {
  const modelStatus = safeGetById('modelStatus');
  const modelPathInput = safeGetById('modelPath');
  const useEnsembleInput = safeGetById('useEnsemble');
  
  if (!modelStatus) return;

  modelStatus.style.display = 'block';
  modelStatus.className = 'model-status warning';
  modelStatus.innerHTML = '⏳ Memeriksa model...';

  const basePath = modelPathInput?.value || chrome.runtime.getURL('captcha-model/');
  const useEnsemble = useEnsembleInput?.checked ?? true;
  
  const requiredModels = ['bbox_detector.onnx', 'digit_model_0.onnx'];
  if (useEnsemble) {
    requiredModels.push('digit_model_1.onnx', 'digit_model_2.onnx');
  }

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

  if (allFound) {
    modelStatus.className = 'model-status success';
    modelStatus.innerHTML = `<strong>✅ Semua model tersedia!</strong><br>${results.join('<br>')}`;
  } else {
    modelStatus.className = 'model-status error';
    modelStatus.innerHTML = `<strong>⚠️ Beberapa model tidak ditemukan:</strong><br>${results.join('<br>')}<br><br>
      <small>Pastikan file model sudah di-copy ke folder yang benar.</small>`;
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

