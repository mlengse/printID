chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
  // Ensure the tab update is complete and the tab has a URL
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['jcareUrl', 'puskesmasName'], function(settings) {
      const storedJcareUrl = settings.jcareUrl;
      const storedPuskesmasName = settings.puskesmasName || 'PKM Default'; // Default if not set

      if (storedJcareUrl && tab.url.startsWith(storedJcareUrl)) {
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
          }).then(() => {
            // Send settings through chrome runtime message (instead of writing to page)
            chrome.tabs.sendMessage(tab.id, { 
              type: 'SET_PUSKESMAS_NAME', 
              puskesmasName: storedPuskesmasName 
            }).catch(err => console.error('Failed to send message:', err));
          }).catch(err => console.error('Failed to execute scripts:', err));
        } else if (tab.url.includes('/healthcenters/rekap_pemakaian_obat')) { // Assuming this path for drug labels
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [
              "jquery-3.7.1.min.js",
              'resep.js'
            ]
          }).catch(err => console.error('Failed to execute scripts:', err));
        } else if (tab.url.includes('/j-care/bpjs/apis/detail/')) { // Path for BPJS detail page with screening check
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['bpjs_skrining.js']
          }).catch(err => console.error('Failed to execute BPJS skrining script:', err));
        }
      }
    });
    
    // Inject autofill script to BPJS skrining website
    if (tab.url && (tab.url.startsWith('https://webskrining.bpjs-kesehatan.go.id/skrining') || tab.url.includes('webskrining.bpjs-kesehatan.go.id'))) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['bpjs_skrining_autofill.js']
      // }).then(() => {
        // console.log('BPJS skrining autofill script injected successfully');
      }).catch(err => console.error('Failed to execute BPJS skrining autofill script:', err));
    }
  }
});
