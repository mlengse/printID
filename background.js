importScripts('config.js');

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
  // Ensure the tab update is complete and the tab has a URL
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['systemUrl', 'puskesmasName'], function(settings) {
      const storedSystemUrl = settings.systemUrl;
      const storedPuskesmasName = settings.puskesmasName || 'Unit Default'; // Default if not set

      if (storedSystemUrl && tab.url.startsWith(storedSystemUrl)) {
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
        } else if (tab.url.includes(self.APP_CONFIG.API_DETAIL)) { // Path for detail page with screening check
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['config.js', 'domHelpers.js', 'health_screening.js']
          }).catch(err => console.error('Failed to execute screening script:', err));
        }
      }
    });
    
    // Inject CAPTCHA solver scripts to screening website
    if (tab.url && (tab.url.startsWith(self.APP_CONFIG.SCREENING_URL) || tab.url.includes(self.APP_CONFIG.SCREENING_URL.replace('https://', '')))) {
      const extensionUrl = chrome.runtime.getURL('');
      
      // Get screening data from storage
      chrome.storage.local.get(['health-screening-data'], (result) => {
        const screeningData = result['health-screening-data'] || null;
        console.log('Screening data from storage:', screeningData);
        
        // First, inject the extension URL and screening data as global variables
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (url, data) => {
            window.__APP_EXTENSION_URL__ = url;
            window.__HEALTH_SCREENING_DATA__ = data;
            console.log('Extension URL set:', url);
            console.log('Screening Data set:', data);
          },
          args: [extensionUrl, screeningData],
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
          files: ['config.js', 'captcha_solver.js'],
          world: 'MAIN'
        });
      }).then(() => {
        console.log('Solver injected, now injecting autofill...');
        // Finally inject autofill
        return chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['health_screening_autofill.js'],
          world: 'MAIN'
        });
      }).then(() => {
        console.log('All CAPTCHA solver scripts injected successfully');
      }).catch(err => console.error('Failed to execute solver scripts:', err));
      }); // Close chrome.storage.local.get callback
    }
  }
});
