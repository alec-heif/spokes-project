$(function() {
	var trail_name = getQueryVariable("trail");
	console.log(trail_name);
	routes = data["routes"];
	var trail;
	for(var i in routes){
		if (routes[i]["name"] == trail_name) {
			trail = routes[i];
		}
	}
	$("#trail_name").text(trail["name"]);
	$("#distance").text(trail["length"] + " miles");

	var attributes_text =
			trail["difficulty"] + " \xB7 "
			+ trail["terrain"] + " terrain \xB7 "
			+ trail["scenery"] + " scenery";
	$("#attributes").text(attributes_text);

	$("#description").text(trail["description"]);
	$("#author_name").text(trail["explorer"]);

	$("#trail_map").attr("src", "content/images/" + trail["images"][trail["images"].length - 1]);

	
	for(var i in trail["comments"]) {
		var comment = trail["comments"][i];
		console.log(comment);
		var comment_div = document.createElement('div');
		comment_div.className = "comment";
		var comment_text_div = document.createElement('div');
		comment_text_div.className = "comment_text";
		comment_text_div.innerHTML = comment["text"];
		var comment_author_div = document.createElement('div');
		comment_author_div.className = "author";
		comment_author_div.innerHTML = 
			moment.unix(comment["timestamp"]).fromNow() + 
			' by <a class="author_name" href="">'
			+ comment["creator"]
			+ '</a>';
		var comment_image = document.createElement('img');
		comment_image.src = "content/icons/avatar_default.png";
		comment_image.className = "comment_author_image";
		comment_div.appendChild(comment_image);
		comment_div.appendChild(comment_text_div);
		comment_div.appendChild(comment_author_div);
		$("#comments_list").prepend(comment_div);
	}


});

function getQueryVariable(variable) {
	// From http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}