async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({ 
    active: true, 
    lastFocusedWindow: true 
  });
  return tab;
}

// let runss = false
// Called when the url of a tab changes.

// let injectedDrug = false
// let injectedPrint = false
chrome.tabs.onUpdated.addListener(async function() {
  // console.log('updated')
  let tab = await getCurrentTab();
  // Listen for any changes to the URL of any tab.
  // If the tabs url starts with 'http://192.168.1.99/j-care/visits/add_registrasi'...
  if (tab.url ) {
    if(
      tab.url.includes('/j-care/visits')
      // && !injectedPrint
    ) {

      // injectedPrint = true

      // chrome.storage.local.get(['injectedPrint'], async function (result) {
      //   console.log(result.injectedPrint)
      //   if(!result.injectedPrint){
      //     chrome.storage.local.set({injectedPrint: true})
          chrome.scripting.executeScript({
            target: {
              tabId: tab.id
            },
            files: [ 
              "jquery-3.7.1.min.js",
              "jquery-migrate.min.js",
              "bardcode.min.js", 
              "base64.min.js" ,
              "sprintf.min.js",
              "jsLabel2PDF.js",
              "content_script.js",
              ]
          });
  
      //   }
      // })

    } else if(
      tab.url.includes('j-care/healthcenters/rekap_pemakaian_obat')
      // && !injectedDrug
    ) {

      // injectedDrug = true

      // const scripts = await chrome.scripting.getRegisteredContentScripts();
      // const scriptIds = scripts.map(script => script.id);
      // console.log(scriptIds)


      // chrome.storage.local.get(['injectedDrug'], async function (result) {
      //   console.log(result.injectedDrug)
      //   // if(!result.injectedDrug){
  
      //     chrome.storage.local.set({injectedDrug: true})
          chrome.scripting.executeScript({
            target: {
              tabId: tab.id
            },
            files: [ 
              "jquery-3.7.1.min.js",
              'resep.js'
            ]
          });
        // }
    //   })
  
    }

  }
});


