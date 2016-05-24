chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
 if (request.action == "getDOM")
   sendResponse({dom: "The dom that you want to get"});
 else
   sendResponse({}); // Send nothing..
});