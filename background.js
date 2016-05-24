
chrome.tabs.query(
 {currentWindow: true, active : true}, function(tab_array) {

 	chrome.browserAction.setIcon({path: "optly_inactive.png", tabId:tab_array[0].id});
 }
);

chrome.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  if ((msg.from === 'content') && (msg.subject === 'hasOptimizely')) {

  	chrome.tabs.query(
 	 {currentWindow: true, active : true}, function(tab_array) {

 	 	chrome.browserAction.setBadgeText({text: "!", tabId: tab_array[0].id});
    	chrome.browserAction.setIcon({path: "optly_active.png", tabId: tab_array[0].id});
 	 }
	);

  }
});
