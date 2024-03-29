async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({ 
    active: true, 
    lastFocusedWindow: true 
  });
  return tab;
}

// let runss = false
// Called when the url of a tab changes.

chrome.tabs.onUpdated.addListener(async function() {
  let tab = await getCurrentTab();
  // Listen for any changes to the URL of any tab.
  // If the tabs url starts with 'http://192.168.1.99/j-care/visits/add_registrasi'...
  if (tab.url ) {
    if(
      tab.url.includes('/j-care/visits')
    ) {
      // Called when the user clicks on the page action.

      // chrome.action.onClicked.addListener(function() {

      chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        files: [ 
          "jquery-1.11.3.js", 
          "bardcode.min.js", 
          "base64.min.js" ,
          "sprintf.min.js",
          "jsLabel2PDF.js",
          "content_script.js",
          ]
      });

    } else if(
      tab.url.includes('j-care/healthcenters/rekap_pemakaian_obat')
    ) {
        chrome.scripting.executeScript({
          target: {
            tabId: tab.id
          },
          files: [ 
            "jquery-1.11.3.js", 
            'resep.js'
          ]
        });

  
    }


  }
});


