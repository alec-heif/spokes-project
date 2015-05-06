var ref = new Firebase('https://spokes-project.firebaseio.com/');
var data;
function loadData(callback) {
	ref.once("value", function(s){
		data = s.val()
		callback();
	})
}



