// Saves options to chrome.storage.local.
function save_options() {
  const jcareUrlInput = safeGetById('jcareUrl');
  const puskesmasNameInput = safeGetById('puskesmasName');
  
  if (!jcareUrlInput || !puskesmasNameInput) {
    console.error('[options.js] Required input elements not found');
    return;
  }

  const jcareUrl = jcareUrlInput.value;
  const puskesmasName = puskesmasNameInput.value;

  chrome.storage.local.set({
    jcareUrl: jcareUrl,
    puskesmasName: puskesmasName
  }, function() {
    // Update status to let user know options were saved.
    const status = safeGetById('status');
    if (status) {
      status.textContent = 'Pengaturan disimpan.';
      setTimeout(function() {
        status.textContent = '';
      }, 1500);
    }
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({
    jcareUrl: '', // Default value
    puskesmasName: '' // Default value
  }, function(items) {
    const jcareUrlInput = safeGetById('jcareUrl');
    const puskesmasNameInput = safeGetById('puskesmasName');
    
    if (jcareUrlInput) jcareUrlInput.value = items.jcareUrl;
    if (puskesmasNameInput) puskesmasNameInput.value = items.puskesmasName;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);

const saveBtn = safeGetById('save');
if (saveBtn) {
  saveBtn.addEventListener('click', save_options);
} else {
  console.error('[options.js] Save button not found');
}
