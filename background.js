async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({ 
    active: true, 
    lastFocusedWindow: true 
  });
  return tab;
}

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
  // Ensure the tab update is complete and the tab has a URL
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['jcareUrl', 'puskesmasName'], function(settings) {
      const storedJcareUrl = settings.jcareUrl;
      const storedPuskesmasName = settings.puskesmasName || 'PKM Default'; // Default if not set

      if (storedJcareUrl && tab.url.startsWith(storedJcareUrl)) {
        // Set the Puskesmas name as a global variable for content scripts
        // This is a workaround because direct modification of content_script.js is failing
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (name) => { window.EXTENSION_PUSKESMAS_NAME = name; },
          args: [storedPuskesmasName]
        }).then(() => {
          // Now check for specific paths for different scripts
          if (tab.url.includes('/visits')) { // Assuming '/visits' is part of the path for patient labels
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: [
                "jquery-3.7.1.min.js",
                "jquery-migrate.min.js",
                "bardcode.min.js",
                "base64.min.js" ,
                "sprintf.min.js",
                "jsLabel2PDF.js",
                "content_script.js"
              ]
            });
          } else if (tab.url.includes('/healthcenters/rekap_pemakaian_obat')) { // Assuming this path for drug labels
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: [
                "jquery-3.7.1.min.js",
                // jQuery Migrate might also be useful here if resep.js has compatibility needs
                // "jquery-migrate.min.js",
                'resep.js'
              ]
            });
          }
        }).catch(err => console.error('Failed to set global variable or execute scripts:', err));
      }
    });
  }
});
