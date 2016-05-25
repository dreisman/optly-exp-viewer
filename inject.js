// inject.js
// Script to be injected on webpage


// Get request from content script to start executing
// optimizely experiments

console.log("Registering listener for experiment execution");
window.addEventListener("message", function(event) {
  if (event.data.from == "executeExperiments") {
  	// Iterate through Optly object and execute code
  	console.log("Starting experiment execution");
  	experiments = optimizely.data["experiments"];
  	for (var key in experiments) {
  		if (experiments.hasOwnProperty(key)) {
  			// Execute main experiment set-up code
  			var global_eval = eval;
  			if (experiments[key].hasOwnProperty("code") && experiments[key]["code"] !== "") {
  				var experiment_code = experiments[key]["code"].replace(/\$\(/g, "jQuery(");

  				console.log(experiment_code);
  				global_eval(experiment_code);
  			}
  			// Execute code of each variation
  			variation_ids = experiments[key]["variation_ids"];
  			console.log(variation_ids);
  			//for (var i = 0; i < variation_ids.length; i++) {
  			var i = 0;
  			if (variation_ids.length > 0) i = 1;
  				console.log(variation_ids[i]);
				if (optimizely.data["variations"][variation_ids[i]].hasOwnProperty("code") && 
					optimizely.data["variations"][variation_ids[i]] !== "") {
					var variation_code = optimizely.data["variations"][variation_ids[i]]["code"].replace(/\$\(/g, "jQuery(");
					console.log(variation_code);	
					global_eval(variation_code);
				}
  				
  			//}
  		}
  	}

  	// Send message to content script to notify that
  	// experiment execution is complete
  	setTimeout(function() { 
	  	console.log("Experiments executed, notifying content script");
	  	var stop_optly_exps = {from: "experimentStop"};
	  	window.postMessage(stop_optly_exps, "*");
	}, 900); 

  }
}, false);


// Get presence of optimizely object and send to content script
var ret = {};
if (typeof window.optimizely === 'undefined') {
  console.log("no optly");
  ret = {
  	from: "FROM_PAGE_WITH_OPTIMIZELY",
    hasOptimizely: false
  };
}
else {
  console.log("has optly");
  ret = {
  	from: "FROM_PAGE_WITH_OPTIMIZELY",
    hasOptimizely: true,
    data: window.optimizely.data
  };
}
window.postMessage(
	ret,
	"*"
);
