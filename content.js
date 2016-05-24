/*// Inform the background page that 
// this tab should have a page-action
chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});*/

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
  }
}, false);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  // First, validate the message's structure

  if ((msg.from === 'popup') && (msg.subject === 'getOptimizely')) {
    var ret = {};
    if (!hasOptly) {
      console.log("no optly");
      ret = {
        hasOptimizely: false
      };
    }
    else {
      console.log("has optly");
      ret = {
        hasOptimizely: true,
        data: optlyData
      };
    }

    response(ret);
  }

});