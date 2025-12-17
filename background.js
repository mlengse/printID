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
              "domHelpers.js",
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
              "domHelpers.js",
              "jquery-3.7.1.min.js",
              'resep.js'
            ]
          }).catch(err => console.error('Failed to execute scripts:', err));
        } else if (tab.url.includes('/j-care/bpjs/apis/detail/')) { // Path for BPJS detail page with screening check
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['domHelpers.js', 'bpjs_skrining.js']
          }).catch(err => console.error('Failed to execute BPJS skrining script:', err));
        }
      }
    });
    
    // Inject CAPTCHA solver scripts to BPJS skrining website
    if (tab.url && (tab.url.startsWith('https://webskrining.bpjs-kesehatan.go.id/skrining') || tab.url.includes('webskrining.bpjs-kesehatan.go.id'))) {
      const extensionUrl = chrome.runtime.getURL('');
      
      // Get skrining data from storage
      chrome.storage.local.get(['bpjs-skrining-data'], (result) => {
        const skriningData = result['bpjs-skrining-data'] || null;
        console.log('Skrining data from storage:', skriningData);
        
        // First, inject the extension URL and skrining data as global variables
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (url, data) => {
            window.__BPJS_EXTENSION_URL__ = url;
            window.__BPJS_SKRINING_DATA__ = data;
            console.log('BPJS Extension URL set:', url);
            console.log('BPJS Skrining Data set:', data);
          },
          args: [extensionUrl, skriningData],
          world: 'MAIN'
        }).then(() => {
        console.log('Extension URL injected, now injecting ONNX Runtime...');
        // Then inject ONNX Runtime into MAIN world
        return chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['ort.min.js'],
          world: 'MAIN'
        });
      }).then(() => {
        console.log('ONNX Runtime injected, now injecting solver...');
        // Then inject solver
        return chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['bpjs_captcha_solver.js'],
          world: 'MAIN'
        });
      }).then(() => {
        console.log('Solver injected, now injecting autofill...');
        // Finally inject autofill
        return chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['bpjs_skrining_autofill_page.js'],
          world: 'MAIN'
        });
      }).then(() => {
        console.log('All BPJS CAPTCHA solver scripts injected successfully');
      }).catch(err => console.error('Failed to execute BPJS solver scripts:', err));
      }); // Close chrome.storage.local.get callback
    }
  }
});
