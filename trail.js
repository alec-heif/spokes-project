var thisTrailID;
var dummy = false;
$(function() {
	loadData(function(){


		var trail_id = getQueryVariable("trail");
        if (trail_id == "create") {
            create_populate();
            return;
        }
        thisTrailID = trail_id;

		var trail = get_trail_by_id(trail_id);

        // Get the route coordinates from the trail object and put them on the map.
        console.log("set routeCoords");
        routeCoords = trail.coords;
        console.log(routeCoords);        

		var trail_name = trail.name;
		document.title = trail_name + " | Spokes";
		
		if(is_trail_editable(trail)){
			$(".editor").show();
			setEditorValues(trail);
			//return;
		} else {
		
			$("#trail_name").text(trail["name"]);
			
			$("#difficulty").text(trail["difficulty"]);
			$("#terrain").text(trail["terrain"]);
			$("#scenery").text(trail["scenery"]);
			$("#description").text(trail["description"]);
            isCreateMode = false; // make the map not editable.
			
		}

        // Initialize the map.
        initialize();

		$("#author_name").text(trail["explorer"]);
		$("#distance").text(trail["length"] + " miles");

		//should this go inside the block?
    	var coords = trail.coords;
    	var url = 'https://maps.googleapis.com/maps/api/staticmap?center=42.364251817286835,-71.10334396362305&zoom=13&size=400x300&markers=color:green%7clabel:A%7c42.364251817286835,-71.10334396362305&markers=color:red%7clabel:B%7c42.36222240121285,-71.10566139221191&path=color:0x000000%7cweight:5%7c42.364251817286835,-71.10334396362305%7c42.35527749714674,-71.09999656677246%7c42.362412661754455,-71.1101245880127%7c42.36532991791331,-71.10634803771973%7c42.36222240121285,-71.10566139221191';
    	$('#map_div').css({'background-image': 'url(' + url + ')', 'background-repeat': 'no-repeat', 'background-size': '100%'});

    //TODO need someone to finish my stuff


		//$("#cover_image").attr("src", /*"content/images/" +*/ trail["images"][trail["images"].keys()[0]]);
		
		//$("#trail_map").attr("src", "content/images/" + trail["images"][trail["images"].length - 1]);

		
		for(var i in trail["comments"]) {
			var comment = trail["comments"][i];
			//console.log(comment);
			var comment_div = document.createElement('div'); // comment_div = $('<div>').addClass('comment_text');
			comment_div.className = "comment";
			var comment_text_div = document.createElement('div');
			comment_text_div.className = "comment_text";
			comment_text_div.innerHTML = comment["text"];
			var comment_author_div = document.createElement('div');
			comment_author_div.className = "author";
			comment_author_div.innerHTML = 
				moment.unix(comment["timestamp"]).fromNow() + 
				' by <span class="author_name" href="">'
				+ comment["creator"]
				+ '</span>';
			var comment_image = document.createElement('img');
			comment_image.src = "content/icons/avatar_default.png";
			comment_image.className = "comment_author_image";
			comment_div.appendChild(comment_image);
			comment_div.appendChild(comment_text_div);
			comment_div.appendChild(comment_author_div);
			$("#comments_list").prepend(comment_div);
		}

		/*for(var i=0; i < trail["images"].length - 1; i++) {
			var image = document.createElement('img');
			image.src = "content/images/" + trail["images"][i];
			image.className = "trail_image";
			var li = document.createElement('li');
			li.appendChild(image);
			$("#images_list").append(li);
		}*/
		var isFirst = true;
		for (var key in trail["images"]) {
			var image = document.createElement('img');
			var src = trail["images"][key];
			image.src = src;
			image.className = "trail_image";
			var a = document.createElement('a');
			a.appendChild(image);
            a.href = image.src;
			$("#images_list").append(a);
			if (isFirst) {
				$("#cover_image").attr("src", src);
				isFirst = false;
			}
		}
        /*
		$("#images_list").bxSlider({
			auto: true,
			autoControls: true,
			adaptiveHeight: true,
	  		mode: 'fade'
		});

		document.title = trail["name"] + " | Spokes";
	//});


        for(var i=0; i < trail["images"].length - 1; i++) {
          var image = document.createElement('img');
          image.src = "content/images/" + trail["images"][i];
          image.className = "trail_image";
          var a = document.createElement('a');
          a.appendChild(image);
          a.href = image.src;
          $("#images_list").append(a);
      }
      */
      $("#images_list").magnificPopup({
        delegate: 'a', // child items selector, by clicking on it popup will open
        type: 'image',
        gallery:{enabled:true}
    });

      document.title = trail["name"] + " | Spokes";



  });
});


$(function(){
	$("#yourcomment").on("keyup", function(){
		//console.log("comment changed");
		validatePostCommentButton();
	});
      $("#postcommentbutton").on("click", function(){
          if ($("#yourcomment").val()) {
             submitComment();
         }
    	1});
    validatePostCommentButton();
});

function validatePostCommentButton() {
	$("#postcommentbutton").toggleClass("disabled", !$("#yourcomment").val());
}

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
    window.location = "trail.html?trail=0";
    console.log('Query variable %s not found', variable);
}


// This function will be executed when the user scrolls the page.
$(window).scroll(function(e) {
	var fixed_scroll_max = $('#fixed_elements').height() - $(window).height()
        + $('#topbar').height() + 50;

    //console.log(fixed_scroll_max);

    var fixed_element_shift = -1 * Math.min(fixed_scroll_max, $(this).scrollTop());

    $('#fixed_elements').css({
        'top': fixed_element_shift + 'px'
    });

    $('#scrolling_elements').css({
        'height': (fixed_scroll_max+$(window).height()) + 'px'
    });
});


function submitComment() {
	dummy = false;
	var comment = {
		creator: localStorage.getItem("loggedInAs") || "anonymous",
		text: $("#yourcomment").val(),
		timestamp: Math.floor((new Date())/1000)
	};
	//var id = thisTrail.id - 1; //Don't ask, don't tell
	var commentsRef = new Firebase('https://spokes-project.firebaseio.com/routes/'+thisTrailID+'/comments');
	commentsRef.push(comment, function() {
		//location.reload();
		location.href="trail.html?trail="+thisTrailID;
	})
}

function create_populate() {
    document.title = "Create a new Trail | Spokes";
    console.log("trail.js > create");
    $(".editor").show();
    checkSavability();
    submitDummyTrail();
}



function submitDummyTrail() {
	dummy = true;
	var newTrail = {
		explorer: localStorage.getItem("loggedInAs") || "anonymous",
		//name: "Untitled",
		publicity: "private"
	};
	var trailsRef = new Firebase('https://spokes-project.firebaseio.com/routes');
	var newRef = trailsRef.push(newTrail);
	thisTrailID = newRef.key();
	newRef.child("id").set(thisTrailID);
}

function submitEditedTrail() {
	if (canSave) {
		dummy = false;
		var newName = $("#edittrailname").val();
		var attributes = {
			description: $("#editdescription").val(),
			name: 		 newName,
			difficulty:  $("#editdifficulty").val(),
			terrain:     $("#editterrain").val(),
			scenery:     $("#editscenery").val(),
			publicity:   $("input[name='publicity']:checked").val(),
            coords:      get_trail_by_id(thisTrailID).coords,
		};
		var trailRef = new Firebase('https://spokes-project.firebaseio.com/routes/'+thisTrailID);
		var numberOfKeys = Object.keys(attributes).length;
		var i = 0;
		for (var key in attributes) {
			trailRef.child(key).set(attributes[key], function() {
				i++;
				if (i === numberOfKeys) {
					console.log("DONE!");
					//location.reload();
					location.href="trail.html?trail="+thisTrailID;
				} else {
					console.log("and...");
				}	
			});
		}
	}
}

var canSave = false;
var somethingHasChanged = false;
$(function(){
	$(".editor").on("change", checkSavability).on("keyup", checkSavability);
});
function checkSavability() {
	var publicity = $("input[name='publicity']:checked").val();
	var canPublish = !!(
		$("#edittrailname").val() && 
		$("#editdescription").val() &&
		$("#editdifficulty").val() &&
		$("#editterrain").val() &&
		$("#editscenery").val() &&
		true //Map exists
	);
	console.log("Can publish?", canPublish);
	canSave = somethingHasChanged && (publicity === "private" || canPublish); 

	if (canPublish) {
		$("#whyyoucantpublish").hide();
	} else {
		$("#whyyoucantpublish").show();
		console.log("shanging chanec");
		$("#publishedradio").prop('checked',false);
		$("#privateradio").prop('checked', true);
	}
	$("#savebutton").toggleClass("disabled", !canSave);
	$("#publishedradio").attr("disabled", canPublish ? null : "disabled");
	$("#publishedradiolabel").toggleClass("disabled", !canPublish);	
	somethingHasChanged = true;
}



function setEditorValues(trail) {
	$("#edittrailname").val(trail.name);
	$("#editdescription").val(trail.description);
	$("#editdifficulty").val(trail.difficulty);
	$("#editterrain").val(trail.terrain);
	$("#editscenery").val(trail.scenery);
	$("input[value='"+trail.publicity+"']").attr('checked', 'checked');
	checkSavability();
}

// If you never added anything, delete the dummy.
window.onbeforeunload = function(){
  if (dummy) {
  	alert("deleting dummy!");
  	var trailRef = new Firebase('https://spokes-project.firebaseio.com/routes/'+thisTrailID);
  	trailRef.set(null);
  }
};

function on_map_done() {
    // Colse the map editing modal window
    closeModalWindows();

    // Look up the trail object
    var trail = get_trail_by_id(thisTrailID);
    // Set the trail's coordinates to the coordinates which were just drawn on the map.
    trail.coords = routeCoords;
    var trailRef = new Firebase('https://spokes-project.firebaseio.com/routes/'+thisTrailID);
    getRouteCityState(coords, function(result) {
      var length = getRouteLength(coords);
      if (result) {
        var city = result.city;
        var state = result.state;
      }
      trail.city = city;
      trail.state = state;
      trail.length = length;
      trailRef.child('city').set(city);
      trailRef.child('state').set(state);
      trailRef.child('length').set(length);
    });
    // Save the coords to the database.
    trailRef.child('coords').set(routeCoords, function() {
            console.log("map coords saved to firebase.");
    });
}

function openMapWindow() {
    $('#mapwindow').addClass('is-visible');
    $('.modal-mask').addClass('is-visible');

    // Look up the trail object
    var trail = get_trail_by_id(thisTrailID);

    // set the map's done_func. map.js will call this function when the done button on
    // the map editing modal is clicked.
    map_done_func = on_map_done;





    return false;
}

function get_trail_by_id(trail_id) {
    routes = data["routes"];
    var trail;
    for(var i in routes){
        if (routes[i]["id"] == trail_id) {
            trail = routes[i];
            break;
        }
    }
    return trail;
}

function is_trail_editable(trail) {
    return trail.explorer === "anonymous" || trail.explorer === (localStorage.getItem("loggedInAs"));
}
/*
function submitNewTrail() {
	var newTrail = {
		city: "Cambridge", 
		description: "Insert description here",
		difficulty: "hard", // "medium" "easy" "very hard"
		explorer: localStorage.getItem("loggedInAs") || "anonymous",
		length: "12.3",
		name: "My Trail",
		scenery: "nature",
		state: "England",
		terrain: "mountain"
	};
	trailsRef = new Firebase('https://spokes-project.firebaseio.com/routes');
	trailsRef.push(newTrail, function() {
		location.reload(); //go to newly created trail page
	});
}
*/
