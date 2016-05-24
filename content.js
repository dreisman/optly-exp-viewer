

// Injecting optimizely detection script
var s = document.createElement('script');
s.src = chrome.extension.getURL('inject.js');
/*s.onload = function() {
  this.parentNode.removeChild(this);
}*/
(document.head || document.documentElement).appendChild(s);

var hasOptly = false;
var optlyData;
var port = chrome.runtime.connect();
window.addEventListener("message", function(event) {
  if (event.data.from == "FROM_PAGE") {
    hasOptly = event.data.hasOptimizely;
    optlyData = event.data.data;
    if (hasOptly){
      // Inform the background page that 
      // optimizely exists on the page, to
      // change the extension icon
      chrome.runtime.sendMessage({
        from:    'content',
        subject: 'hasOptimizely'
      });
    }
  }
}, false);


// Listen for messages from the popup
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