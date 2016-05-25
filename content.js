// content.js
// Script with access to DOM of page, but running in an "isolated world"

// border-style: solid;border-color: red;

// Injecting optimizely detection script
var s = document.createElement('script');
s.src = chrome.extension.getURL('inject.js');
(document.head || document.documentElement).appendChild(s);

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

      /* Try to detect changes to dom by executing experiments */

      // Listen and collect changes in the document - these are caused when
      // an experiment is executed.
      var modifiedNodes = [];
      var domMutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          modifiedNodes.push(mutation);
        });
      });


      // Listener for background script to report that code execution is complete.
      window.addEventListener("message", function (event) {
        // First, validate the message's structure
        if ((event.data.from === 'experimentStop')) {
          console.log("Received stop message from injected script");
          domMutationObserver.disconnect();
          console.log("Number of modified nodes: " + modifiedNodes.length);
          $.each(modifiedNodes, function(index, value) {
            console.log(value);
            console.log(modifiedNodes[index].type);
            var node_to_be_bordered = value.target;
            if (value.type === "characterData") {
              node_to_be_bordered = value.target.parentNode;
            } else {
              node_to_be_bordered = value.target;
            }
            console.log(node_to_be_bordered.nodeType);
            if (node_to_be_bordered.nodeType == 1) {
              node_to_be_bordered.setAttribute("style", "border-style:solid;border-color:red;");
            }
          });
        }
      }, false);

      setTimeout(function() {
        console.log("Registering DOM Mutation Observer for experimental changes");
        var config = { attributes: false, childList: true, characterData: true, subtree: true};
        // Observe all links
        $("a, h1, h2, h3, h4, p").each(function(index, value) {
          domMutationObserver.observe(value, config);
        });

        // Tell injected script to start modifying the dom
        console.log("Notifying injected script to start executing experiments");
        window.postMessage({
          from: 'executeExperiments',
        }, "*");
      }, 3000);
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


