// inject.js
// Script to be injected on webpage


//http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
var levDist = function(s, t) {
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n == 0) return m;
    if (m == 0) return n;

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (var j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4) return n;

            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

            if (b < mi) mi = b;
            if (c < mi) mi = c;

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }

    // Step 7
    return d[n][m];
}

// For "simple" matching, we actually use levenshtein distance
// Because the actual optimizely algorithm appears to allow for slight
// difference.
var LEVENSHTEIN_LIMIT = 6;

// Get request from content script to start executing
// optimizely experiments
console.log("Registering listener for experiment execution");
window.addEventListener("message", function(event) {
  if (event.data.from == "executeExperiments") {
    var global_eval = eval;
  	// Iterate through Optly object and execute code
  	console.log("Starting experiment execution");
  	experiments = optimizely.allExperiments;
    global_eval("window.localStorage['pessimizely_expElements'] = '';");
    global_eval("var jQuery = function(arg) {window.localStorage['pessimizely_expElements']+=arg + '|'; throw new Error('Stop!');};");
    //global_eval("var $ = function(arg) {window.localStorage['pessimizely_expElements']+=arg + '|';throw new Error('Stop!');};");

  	for (var key in experiments) {
  		if (experiments.hasOwnProperty(key)) {

  			// Check that URL matches for experiment, else continue
  			if (experiments[key].hasOwnProperty("urls")) {
  				var url_matches = false;
  				for (var i = 0; i < experiments[key]["urls"].length; i++) {
  					url_rule = experiments[key]["urls"][i];
  					if (url_rule["match"] === "substring" && window.location.href.search(url_rule["value"]) != -1) {
              console.log("matched substring: " + url_rule["value"]);
  						url_matches = true;
  						break;
  					}
  					if (url_rule["match"] === "simple" && levDist(window.location.href, url_rule["value"]) < LEVENSHTEIN_LIMIT) {
            //if (url_rule["match"] === "simple" && window.location.href === url_rule["value"]) {
              console.log("matched simple: " + url_rule["value"]);
  						url_matches = true;
  						break;
  					}
  					if (url_rule["match"] === "regex") {
  						var url_regex = new RegExp(url_rule["value"], "i");
  						if (window.location.href.search(url_regex) != -1) {
                console.log("matched regex: " + url_rule["value"]);
  							url_matches = true;
  							break;
  						}
  					}
  				}
  				if (!url_matches) {
            console.log("Didn't match " + url_rule["match"] + " with value " + url_rule["value"]);
  					continue;
          }
  				else {
  					console.log("Page has experiment : " + experiments[key]["name"]);
          }
  			} 
  			// Execute main experiment set-up code
  			if (experiments[key].hasOwnProperty("code") && experiments[key]["code"] !== "") {
  				var experiment_code = experiments[key]["code"].replace(/\$\(/g, "jQuery(");

  				console.log(experiment_code);
          try {
  				  global_eval(experiment_code);
          }
          catch (exception) {
            break;
          }
  			}
  			// Execute code of each variation
  			variation_ids = experiments[key]["variation_ids"];
  			console.log(variation_ids);
  			for (var i = 0; i < variation_ids.length; i++) {
    			console.log(variation_ids[i]);
  				if (optimizely.data["variations"][variation_ids[i]].hasOwnProperty("code") && 
  					optimizely.data["variations"][variation_ids[i]] !== "") {
  					var variation_code = optimizely.data["variations"][variation_ids[i]]["code"].replace(/\$\(/g, "jQuery(");
  					console.log(variation_code);	
            try {
  					 global_eval(variation_code);
            }
            catch (exception) {
              console.log(exception);
              break;
              // Do nothing : we don't care if the experiment succeeds
              // to execute.
            }
  				}
  				
  			}
  		}
  	}

  	// Send message to content script to notify that
  	// experiment execution is complete
  	setTimeout(function() { 
	  	console.log("Experiments executed, notifying content script");
	  	var stop_optly_exps = {from: "experimentStop"};
	  	window.postMessage(stop_optly_exps, "*");
	  }, 100); 
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
    data: window.optimizely.data,
    experiments: window.optimizely.allExperiments
  };
}
window.postMessage(
	ret,
	"*"
);
