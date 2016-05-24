
var ret = {};
if (typeof window.optimizely === 'undefined') {
  console.log("no optly");
  ret = {
  	from: "FROM_PAGE",
    hasOptimizely: false
  };
}
else {
  console.log("has optly");
  ret = {
  	from: "FROM_PAGE",
    hasOptimizely: true,
    data: window.optimizely.data
  };
}
window.postMessage(
	ret,
	"*"
);