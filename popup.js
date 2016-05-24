

function setOptimizelyData(optly) {
  if (optly.hasOptimizely) {
    $("body").append("<h4>Optimizely experiments found</h4>");
  } else {
    $("body").append("<h4>No Optimizely experiments found</h4>");
  }

  //document.getElementById('hasOptimizely').textContent   = optly.hasOptimizely;
  //document.getElementById('optlyData').textContent   = optly.data;
}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {

  // Inject optimizely detection script:


  // ...query for the active tab...

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'getOptimizely'},
        // ...also specifying a callback to be called 
        //    from the receiving end (content script)
        setOptimizelyData);
  });
});