$(function() {

	function display(trail){
		var div = $('<div/>').addClass("panel panel-default trail-panel").appendTo($('#content'));

		var img_accordion_div = $('<div/>').addClass("panel panel-default trail-image-div").attr("id","image_accordion_" + trail["id"]).appendTo(div);
		if (trail["images"]) {
			for(var k in trail["images"]){//(var i=0;i<trail["images"].length;i++){
				var src = trail["images"][k];
				$('<img/>').addClass("trail-image").attr("src",src).appendTo(img_accordion_div);
			}
		}

		var summary_div = $('<div/>').addClass("panel panel-default trail-summary-div").appendTo(div);

		$('<div/>').addClass("trail-name").html(trail["name"]).appendTo(summary_div);

		var summary = $('<div/>').appendTo(summary_div).addClass("trail-summary");
		var display;
		if (typeof trail["length"] === 'number') {
		  display = trail['length'].toFixed(2);
		}
		else if(typeof trail["length"] === 'string') {
		  display = trail['length'];
		}
		$('<div/>').appendTo(summary).addClass("trail-length").html(display + " miles long");
		$('<div/>').appendTo(summary).addClass("trail-difficulty").html(trail["difficulty"]);
		$('<div/>').appendTo(summary).addClass("trail-terrain").html(trail["terrain"]);
		$('<div/>').appendTo(summary).addClass("trail-scenery").html(trail["scenery"]);
		$('<div/>').appendTo(summary).addClass("trail-explorer").html(trail["explorer"]);
		$('<div/>').appendTo(summary).addClass("trail-description").html(trail["description"]);

		$('<div/>').appendTo(div).css("clear","both");

		$("#image_accordion_" + trail["id"]).zAccordion({
			startingSlide: 0,
			auto: false,
			tabWidth: "15%",
			width: "100%",
			height: 300,
			trigger: "mouseover",
			invert: true,
			speed: 300
		});

		div.click(function(){window.location='trail.html?trail='+trail["id"]});
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
			no_trails_found();
		}
		update_hash(constraints);
	}

	function no_trails_found(){
		$('<div/>').appendTo('#content').addClass('no_trails').html('No Trails Found!');
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

	// determines if a trail matches the given constraints
	// ensures that all provided constraints are met
	function matches_constraint(trail,c){
		//return true;
		console.log("TRAIL!", trail.name);
		// never display hidden rides, unless they're explored by me.
		if (trail.publicity === "private" && trail.explorer !== localStorage.getItem("loggedInAs")) {
			console.log("asdf1");
			return false;
		}
		if(!find(trail,c["keyword"])){
			return false;
			console.log("asdf2");
		}


		if(c["length"][1] != 100 && parseFloat(trail["length"]) > c["length"][1]){
			console.log("asdf3");
			return false;

		}
		if(parseFloat(trail["length"]) < c["length"][0]){
			console.log("asdf4");
			return false;
		}

		var any = false;
		for(var i=0;i<c["attractions"].length;i++){
			if(trail["attractions"].indexOf(c["attractions"]) == -1){
				if(!c["match_any"]){
					console.log("asdf5");
					return false;
				}
			}
			else{
				any = true;
			}
		}

		if(!any && c["attractions"].length > 0){
			console.log("asdf6");
			return false;
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
			var location = get_lat_long(c["zip"]);
			var x = parseFloat(location["latitude"])-trail["latitude"];
			var y = parseFloat(location["longitude"])-trail["longitude"];
			if(Math.pow(x,2) + Math.pow(y,2) > Math.pow(c["distance"],2)){
				return false;
			}
		}

		return true;
	}

	// returns search constraints as a dictionary
	function get_constraints(){
		var c = {};
		c["keyword"] = $('#search_field').val();
		c["length"] = slider_values;
		c["match_any"] = $('input[value=match_any]').is(':checked');
		c["attractions"] = []
		$('input[name=attractions]:checked').each(function(){
			c["attractions"].push(this.value);
		});
		["scenery","terrain","difficulty"].forEach(function(key){
			c[key] =  $('input[name='+key+']:checked').val();
		});
		if($('input[name=location]').is(':checked')){
			var zip = $('input[id=zip]').val();
			if(zip.length == 5 && Number(zip) > 0){
				c["distance"] = $('#location_distance').val();
				c["zip"] = zip;
			}
		}
		return c;
	}

	// updates filter on every user input

	$("input[type=text]").keyup(function(){
		updateFilter();
	});


    $("input").change(function(){
    	updateFilter();
    });

    $("select").change(function(){
    	updateFilter();
    })

	// search slider

	var slider_values;

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
		slider_values = [start,end];
		updateFilter();
    }

    window.onresize = function(){
		$(".main").css("height",window.innerHeight - 100);

		$('#content').css("width",$('.main').width() - 500);
    }

    var current_location;
	$.get("http://ipinfo.io", function(response) {
		current_location = response.loc.split(',');
	$('#zip').val(response.postal);
	}, "jsonp");

	function get_lat_long(zip){
		return {"latitude": NaN, "longitude": NaN}
	}

	function update_hash(constraints){
		var hash = [];
		if(constraints.keyword){
			hash.push("keyword~"+constraints.keyword);
		}
		var length = constraints.length;
		if(length[0] != 0 || length[1] != "100+"){
			hash.push("length~"+length[0]+"~"+length[1]);
		}
		if(constraints.match_any){
			hash.push("match_any");
		}
		if(constraints.attractions.length > 0){
			hash.push("attractions~"+constraints.attractions.join("~"));
		}
		if(constraints.scenery != "any"){
			hash.push("scenery~"+constraints.scenery);
		}
		if(constraints.terrain != "any"){
			hash.push("terrain~"+constraints.terrain);
		}
		if(constraints.distance){
			hash.push("distance~"+constraints.distance+"~"+constraints.zip);
		}
		if(constraints.difficulty != "any"){
			hash.push("difficulty~"+constraints.difficulty);
		}
		location.hash = hash.join("|");
	}

	var hash = location.hash;
	if(hash){
		var values = hash.substring(1).split('|');
		var params;
		for(var i=0;i<values.length;i++){
			params = values[i].split('~');
			if(params[0] == "keyword"){
				$('#search_field').val(params[1]);
			}
			else if(params[0] == "length"){
				if(Number(params[1]) > 0){
					$( "#length_slider" ).slider("values",0,params[1])
				}
				if(Number(params[2]) > 0){
					$( "#length_slider" ).slider("values",1,params[2])
				}
			}
			else if(params[0] == "match_any"){
				$('input[value=match_any]').attr('checked', true);
			}
			else if(params[0] == "attractions"){
				for(var i=1;i<params.length;i++){
					$('input[value='+params[i]+']').attr('checked', true);
				}
			}
			else if(params[0] == "scenery" || params[0] == "terrain" || params[0] == "difficulty"){
				$('input[value='+params[i]+']').attr('checked', true);
			}
			else if(params[0] == "distance"){
				$('input[name=location]').attr('checked', true);
			}
		}
	}

	loadData(function(){
		update_length_slider();
	});
    
    window.onresize();

});
