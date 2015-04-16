$(function() {


	function display(trail){
		var div = document.createElement('div');
		div.className = "panel panel-default trail-panel";

		var img_accordion_div = document.createElement('div');
		img_accordion_div.className = "panel panel-default trail-image-div";
		img_accordion_div.id = "image_accordion_" + trail["id"];
		for(var i=0;i<trail["images"].length;i++){
			var img_div = document.createElement('div');
			img_div.className = "trail-image";
			img_div.style.backgroundImage = "url(content/images/" + trail["images"][i] + ")";
			img_accordion_div.appendChild(img_div);
		}
		div.appendChild(img_accordion_div);

		var summary_div = document.createElement('div');
		summary_div.className = "panel panel-default trail-summary-div";

		var name_div = document.createElement('div');
		var name = document.createTextNode(trail["name"]);
		name_div.appendChild(name);
		name_div.className = "trail-name";
		summary_div.appendChild(name_div);

		var summary = document.createElement('div');

		var trailLength = document.createElement('div');
		trailLength.className = "trail-length";
		trailLength.innerHTML = trail["length"] + " miles long";

		var trailDifficulty = document.createElement('div');
		trailDifficulty.className = "trail-difficulty";
		trailDifficulty.innerHTML = trail["difficulty"];

		var trailTerrain = document.createElement('div');
		trailTerrain.className = "trail-terrain";
		trailTerrain.innerHTML = trail["terrain"];

		var trailScenery = document.createElement('div');
		trailScenery.className = "trail-scenery";
		trailScenery.innerHTML = trail["scenery"];

		var trailExplorer = document.createElement('a');
		trailExplorer.className = "trail-explorer";
		trailExplorer.href = "";
		trailExplorer.innerHTML = trail["explorer"];

		var trailDescription = document.createElement('div');
		trailDescription.className = "trail-description";
		trailDescription.innerHTML = trail["description"];

		/*append(attributes_text,summary);
		summary.appendChild(document.createElement('br'));
		append("Description: ",summary);
		append(trail["description"],summary);*/
		summary.appendChild(trailLength);
		summary.appendChild(trailDifficulty);
		summary.appendChild(trailTerrain);
		summary.appendChild(trailScenery);
		
		summary.appendChild(trailDescription);

		summary.appendChild(trailExplorer);

		summary.className = "trail-summary";
		summary_div.appendChild(summary);

		div.appendChild(summary_div);

		var clear_div = document.createElement('div');
		clear_div.style.clear = "both";
		div.appendChild(clear_div);

		div.onclick = function(){window.location='trail.html?trail='+trail["name"]}
		$('#content').append(div);

		$("#image_accordion_" + trail["id"]).zAccordion({
			startingSlide: trail["images"].length - 1,
			auto: false,
			tabWidth: "15%",
			width: "100%",
			height: 300,
			trigger: "mouseover"
		});
	}

	function append(object,div){
		if(typeof object == "string"){
			if(object != ""){
				div.appendChild(document.createElement('br'));
				div.appendChild(document.createTextNode(object));
			}
		}
		else{
			var text = "";
			for(var i=0;i<object.length;i++){
				text += object[i] + " ";
			}
			if(text != ""){
				div.appendChild(document.createElement('br'));
				div.appendChild(document.createTextNode(text));
			}
		}
	}


	// search handler
	var constraints;
	function updateFilter(){
		constraints = get_constraints();
		$('#content').empty();
		for(var trail_name in data["routes"]){
			if(matches_constraint(data["routes"][trail_name],constraints)){
				display(data["routes"][trail_name]);
			}
		}
		if($('#content').children().length == 0){
			console.log("no trails matched");
		}
	}

	function find(object,string){
		if(typeof object == "string"){
			if(object.toLowerCase().indexOf(string.toLowerCase()) != -1){
				return true;
			}
			else{
				return false;
			}
		}
		for(var key in object){
			if(find(object[key],string)){
				return true;
			}
		}
		return false;
	}

	// checks if all elements in array2 are in array1
	function matches_arrays(array1,array2){
		for(var j=0;j<array2.length;j++){
			if(array1.indexOf(array2[j]) == -1){
				return false;
			}
		}
		return true;
	}

	// determines if a trail matches the given constraints
	// ensures that all provided constraints are met
	function matches_constraint(trail,c){

		if(!find(trail,c["keyword"])){
			return false;
		}


		if(c["length"][1] != 100 && trail["length"] > c["length"][1]){
			return false;
		}
		if(trail["length"] < c["length"][0]){
			return false;
		}


		for(var i=0;i<c["attractions"].length;i++){
			if(trail["attractions"].indexOf(c["attractions"]) == -1){
				return false;
			}
		}

		var matches = true;
		["scenery","terrain","difficulty"].forEach(function(key){
			if(c[key] != "any"){
				if(trail[key] != c[key]){
					matches = false;
				}
			}
		});
		if(!matches){
			return false;
		}

		if(c["distance"] != undefined){
			var location = get_current_location();
			var x = location["latitude"]-trail["latitude"];
			var y= location["longitude"]-trail["longitude"];
			if(Math.pow(x,2) + Math.pow(y,2) > Math.pow(c["distance"],2)){
				return false;
			}
		}

		return true;
	}

	function get_current_location(){
		return {"latitude":0,"longitude":0}
	}

	// returns search constraints as a dictionary
	function get_constraints(){
		var c = {};
		c["keyword"] = $('#search_field').val();
		c["length"] = $( "#length_slider" ).slider('values');
		c["attractions"] = []
		$('input[name=attractions]:checked').each(function(){
			c["attractions"].push(this.value);
		});
		["scenery","terrain","difficulty"].forEach(function(key){
			c[key] =  $('input[name='+key+']:checked').val();
		});
		if($('input[name=location]').is(':checked')){
			c["distance"] = $('#location_distance').val();
		}
		return c;
	}

	// updates filter on every user input

	$("input[type=text]").keyup(function(){
		updateFilter();
	});

	
    $("input").change(function(){
    	console.log('hi');
    	updateFilter();
    })

	// search slider

    $( "#length_slider" ).slider({
      range: true,
      min: 0,
      max: 100,
      values: [ 0, 100 ],
      step: 5,
      slide: update_length_slider
    });

    function update_length_slider(event, ui){
    	var start;
    	var end;

    	if(typeof ui !== "undefined"){
    		start = ui.values[0];
    		end = ui.values[1];
    	}

    	else{
	    	start = $( "#length_slider" ).slider( "values", 0 );
	    	end = $( "#length_slider" ).slider( "values", 1 );
	    }
		if(end == "100"){
			end = "100+";
		}
		$( "#length_display" ).text(start +
		" miles - " + end + " miles");
		updateFilter();
    }

    update_length_slider();
    $(".main").css("height",window.innerHeight - 60);
    $(".content").css("height",window.innerHeight - 60);
});

  $.get("http://ipinfo.io", function(response) {
    $('#city').html(response.city + ', ');
    $('#state').html(response.region);
  }, "jsonp");
