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
  /*
  else if ((msg.from === 'content') && (msg.subject === 'executeExperiments')) {
  	$.each(msg.data["experiments"], function(key, value) {
        // Run experimental setup code
        if (value.hasOwnProperty("code") && value["code"] !== "") {
  	      console.log(value["code"]);
          var code = "eval('" + value["code"] + "');";
          console.log(code);
  	      var code_details = { 
  	      	code: "eval('" + value["code"] + "');", 
  	      	runAt: "document_idle" 
  	      };
  	      chrome.tabs.executeScript(sender.tab.id, code_details);
        }
        	
        // Run code for each variation
        $.each(value["variation_ids"], function(index, value) {
        	if (msg.data["variations"][value].hasOwnProperty("code") && msg.data["variations"][value]["code"] !== "") {
  	        var variation_code = msg.data["variations"][value]["code"];
  	        code_details = { 
  	        	code: "eval('" + variation_code + "');",
  	        	runAt: "document_idle" 
  	        };
  	     	chrome.tabs.executeScript(sender.tab.id, code_details);
       	}
        });
      });
      chrome.runtime.sendMessage({
      	from: "background",
      	subject: "experimentStop"
      });
    }*/
});
