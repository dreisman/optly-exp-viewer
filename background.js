// background.js
// Script persists for lifetime of extension across tabs, no
// privileged access to pages themselves.


chrome.tabs.query(
 {currentWindow: true, active : true}, function(tab_array) {
 	chrome.browserAction.setIcon({path: "optly_inactive.png", tabId:tab_array[0].id});
 }
);

chrome.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  if ((msg.from === 'content') && (msg.subject === 'hasOptimizely')) {

	chrome.browserAction.setBadgeText({text: "!", tabId: sender.tab.id});
	chrome.browserAction.setIcon({path: "optly_active.png", tabId: sender.tab.id});


 	 
  }
});
