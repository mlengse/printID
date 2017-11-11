// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the url of a tab changes.
//var addRegistrasi = 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// Listen for any changes to the URL of any tab.
	// If the tabs url starts with 'http://192.168.1.99/j-care/visits/add_registrasi'...
	if (tab.url.indexOf('http://192.168.1.99/j-care/visits/') == 0) {
		executeScripts(null, [ 
			{ file: "jquery-1.11.3.js" }, 
			{ file: "bardcode.min.js" }, 
			{ file: "base64.min.js" },
			{ file: "sprintf.min.js" },
			{ file: "jsLabel2PDF.js" },
			{ file: "content_script.js" }
			//{ code: "label2PDF();" }
		]);
		//chrome.printerProvider.onGetPrintersRequested.addListener(function (resultCallback) {
			//console.log(resultCallback);
			//resultCallback([{
				//id: '192.16.1.18', // printer address
				//name: 'My Printer'
			//}]);
		//});

		// ... show the page action.
		//chrome.pageAction.show(tabId);
	}
});

// Called when the user clicks on the page action.
//chrome.pageAction.onClicked.addListener(function(tab) {
	//executeScripts(null, [ 
		//{ file: "jquery-1.11.3.js" }, 
		//{ file: "bardcode.min.js" }, 
        //{ file: "base64.min.js" },
        //{ file: "sprintf.min.js" },
        //{ file: "jsLabel2PDF.js" },
        //{ file: "content_script.js" },
        //{ code: "label2PDF();" }
    //]);
//});

function executeScripts(tabId, injectDetailsArray)
{
    function createCallback(tabId, injectDetails, innerCallback) {
        return function () {
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback();   // execute outermost function
}