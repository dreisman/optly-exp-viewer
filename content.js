// content.js
// Script with access to DOM of page, but running in an "isolated world"

// border-style: solid;border-color: red;

// Injecting optimizely detection script

setTimeout(function() {
  var s = document.createElement('script');
  s.src = chrome.extension.getURL('inject.js');
  (document.head || document.documentElement).appendChild(s);
}, 1500);
// Register listener for messages from injected script
var hasOptly = false;
var optlyData;
var port = chrome.runtime.connect();
window.addEventListener("message", function(event) {
  // Listen for message from injected script with
  // presence of Optimizely object
  if (event.data.from == "FROM_PAGE_WITH_OPTIMIZELY") {
    hasOptly = event.data.hasOptimizely;
    optlyData = event.data.data;
    if (hasOptly){
      // Inform the background page that 
      // optimizely exists on the page, to
      // change the extension icon
      chrome.runtime.sendMessage({
        from:    'content',
        subject: 'hasOptimizely',
      });


      // Listener for injected script to report that code execution is complete,
      // then use collected selectors to draw borders around modified elements.
      window.addEventListener("message", function (event) {
        // First, validate the message's structure
        if ((event.data.from === 'experimentStop')) {
          var jquerySelectors = window.localStorage["pessimizely_expElements"].split('|');
          for (var i = 0; i < jquerySelectors.length; i++) {
            $(jquerySelectors[i]).attr("style", "border-width:thick;border-style:solid;border-color:red;");
          }
        }
      }, false);
      
      setTimeout(function() {
        var config = { attributes: false, childList: true, characterData: true, subtree: true};
        
        // Tell injected script to start collecting jquery selectors
        console.log("Notifying injected script to start executing experiments");
        window.postMessage({
          from: 'executeExperiments',
        }, "*");
      }, 700); 


    }
  }
}, false);


// Listen for messages from the popup, if it needs data to display.
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure

  if ((msg.from === 'popup') && (msg.subject === 'getOptimizely')) {
    var ret = {};
    if (!hasOptly) {
      ret = {
        hasOptimizely: false
      };
    }
    else {
      ret = {
        hasOptimizely: true,
        data: optlyData
      };
    }

    response(ret);
  }

});


