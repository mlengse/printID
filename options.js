// Saves options to chrome.storage.local.
function save_options() {
  const jcareUrl = document.getElementById('jcareUrl').value;
  const puskesmasName = document.getElementById('puskesmasName').value;

  chrome.storage.local.set({
    jcareUrl: jcareUrl,
    puskesmasName: puskesmasName
  }, function() {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = 'Pengaturan disimpan.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({
    jcareUrl: '', // Default value
    puskesmasName: '' // Default value
  }, function(items) {
    document.getElementById('jcareUrl').value = items.jcareUrl;
    document.getElementById('puskesmasName').value = items.puskesmasName;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
