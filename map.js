var routeCoords = [];
var isCreateMode = true;
var map_done_func;

function initialize() {
  $.get("http://ipinfo.io", function(response) {
    var controlDiv = document.createElement('div');
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '1px solid #000';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '5px';
    controlUI.style.marginRight = '-16px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '24';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Done';
    controlUI.appendChild(controlText);
    controlDiv.index = 10;
    controlDiv.style['z-index'] = 10;

    var zoomControlDiv = document.createElement('div');
    zoomControlDiv.style.padding = '5px';
    zoomControlDiv.id = 'zoomControlDiv';
    
    var zoomControlWrapper = document.createElement('div');
    zoomControlWrapper.style.marginLeft = '-8px';
    zoomControlDiv.appendChild(zoomControlWrapper);

    function createButton(image) {
      var buttonContainer = document.createElement('div');
      var button = document.createElement('span');
      buttonContainer.style.cursor = 'pointer';
      buttonContainer.style.textAlign = 'center';
      buttonContainer.style.width = '34px';
      buttonContainer.style.height = '34px';
      button.style.backgroundImage = 'url(' + image + ')';
      buttonContainer.style.display = 'inline-block';
      button.style.display = 'inline-block';
      buttonContainer.style.border = '1px solid #000';
      buttonContainer.style.borderRadius = '3px';
      buttonContainer.style.backgroundColor = '#fff';
      buttonContainer.style.marginLeft = '1px';
      buttonContainer.style.marginRight = '1px';
      button.style.margin = '1px';
      button.style.backgroundRepeat = 'no-repeat';
      button.style.height = '32px';
      button.style.width = '32px';
      buttonContainer.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';

      buttonContainer.appendChild(button);
      return buttonContainer;
    }


    zoomControlDiv.index = 10;

    var loc = response.loc.split(',');
    var mapOptions = {
      zoom: 15,
      center: new google.maps.LatLng(loc[0], loc[1]),
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYLINE,
      drawingControl: false,
      polylineOptions: {
        clickable: true,
        draggable: false,
        editable: false,
        geodesic: false,
        strokeColor: '#000000',
        strokeOpacity: 1,
        strokeWeight: 5
      } 
    });
    drawingManager.setMap(null);
    
    var styles = [
      {
        featureType: "transit",
        elementType: "labels",
        stylers: [{
          visibility: "off"
        }]
      },
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{
          visibility: "off"
        }]
      }

    ];
    var styledMap = new google.maps.StyledMapType(styles, {name: 'Styled Map'}); 
    map.mapTypes.set("Styled Map", styledMap); 
    map.setMapTypeId("Styled Map");
    var lineDrawn = undefined;
    var bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);
    var eraser = false;
    var markers = [];
    var start_end_markers = [];
    function resetStartEndMarkers() {
      if (!lineDrawn) {
        start_end_markers.forEach(function(marker) { marker.setMap(null); });
        start_end_markers = [];
        return;
      }
      if (start_end_markers.length === 0) {
        var firstIcon = 'start.png';
        var firstMarker = new google.maps.Marker({position: lineDrawn.getPath().getAt(0), map: map, icon: firstIcon, clickable: false});
        start_end_markers.push(firstMarker);
        var lastIcon = 'end.png';
        var lastMarker = new google.maps.Marker({position: lineDrawn.getPath().getAt(lineDrawn.getPath().getLength()-1), map: map, icon: lastIcon, clickable: false});
        start_end_markers.push(lastMarker);
        return;
      }
      if (start_end_markers[0].position !== lineDrawn.getPath().getAt(0)) {
        start_end_markers[0].setMap(null);
        var firstIcon = 'start.png';
        var firstMarker = new google.maps.Marker({position: lineDrawn.getPath().getAt(0), map: map, icon: firstIcon, clickable: false});
        start_end_markers[0] = firstMarker;
      }
      if (start_end_markers[1].position !== lineDrawn.getPath().getAt(lineDrawn.getPath().getLength() - 1)) {
        start_end_markers[1].setMap(null);
        var lastIcon = 'end.png';
        var lastMarker = new google.maps.Marker({position: lineDrawn.getPath().getAt(lineDrawn.getPath().getLength()-1), map: map, icon: lastIcon, clickable: false});
        start_end_markers[1] = lastMarker;
      }
    }
    google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) {
      lineDrawn = polyline;
      drawingManager.setMap(null);
      resetStartEndMarkers();
      google.maps.event.addListener(polyline, 'mouseover', function(evt) {
        if (evt.vertex !== undefined && eraser && isCreateMode) {
          map.setOptions({ draggableCursor: 'url(eraser_copy.png) , auto', draggable: false});
        }
      });
      google.maps.event.addListener(lineDrawn, 'mousemove', function(evt) {
        resetStartEndMarkers();
      });
    });
    function makeMarker(vertex, i, length) {
      var color = '#fff';
      var cursor = 'url(eraser_copy.png) , auto';
      if (!isCreateMode) cursor = null;
      var marker = new google.maps.Marker({
        position: vertex,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: color,
          strokeColor: '#000',
          fillOpacity: 1,
          strokeWeight: 1
          },
          map: map,
          cursor: cursor
      }); 
      google.maps.event.addListener(marker, 'mouseover', function(evt) {
        if (!isCreateMode) return;
        marker.setOptions({ icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: color,
          strokeColor: '#000',
          fillOpacity: 1,
          strokeWeight: 1
        }});
      });
      google.maps.event.addListener(marker, 'mouseout', function(evt) {
        if (!isCreateMode) return;
        marker.setOptions({ icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: color,
          strokeColor: '#000',
          fillOpacity: 1,
          strokeWeight: 1
        }});
      });
      google.maps.event.addListener(marker, 'click', function(evt) {
        if (!isCreateMode) return;
        lineDrawn.getPath().removeAt(i);
        if (lineDrawn.getPath().getLength() < 2) {
          lineDrawn.setMap(null);
          console.log('dicks');
          lineDrawn = undefined;
          destroyMarkers();
          resetStartEndMarkers();
          return;
        }
        createAndDestroyMarkers(); 
      });
      return marker;
    }
    function createAndDestroyMarkers() {
      var temp = createMarkers();
      destroyMarkers();
      markers = temp;
    }
    function createMarkers() {
      var markers = [];
      lineDrawn.getPath().forEach(function(vertex, i) {
        markers.push(makeMarker(vertex, i, lineDrawn.getPath().getLength()));
      });
      resetStartEndMarkers();
      return markers;
    }
    function destroyMarkers() {
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];
    }
    function dragMode() {
      destroyMarkers();
      drawingManager.setMap(null);
      map.setOptions({ draggableCursor: null, draggable: true});
      lineDrawn && lineDrawn.setOptions({editable: true, clickable: true});
      resetStartEndMarkers();
      eraser = false;
    }
    if (isCreateMode) {
      var images = ['cursor.png', 'pencil.png', 'eraser.png', 'zoom_in.png', 'zoom_out.png'];
      var buttons = images.map(createButton);
      var actual_buttons = buttons.map(function(c) {return c.firstChild;});
      buttons.forEach(function(button) { zoomControlWrapper.appendChild(button); });
      google.maps.event.addDomListener(buttons[0], 'click', function() {
        buttons[0].style.backgroundColor = '#F56218';
        buttons[1].style.backgroundColor = '#fff';
        buttons[2].style.backgroundColor = '#fff';
        dragMode();
      });
      google.maps.event.addDomListener(buttons[1], 'click', function() {
        if(lineDrawn) {
          dragMode();
          buttons[0].style.backgroundColor = '#F56218';
          buttons[1].style.backgroundColor = '#fff';
          buttons[2].style.backgroundColor = '#fff';
        }
        else {
          drawingManager.setMap(map);
          map.setOptions({ draggableCursor: 'crosshair', draggable: true});
          eraser = false;
          buttons[0].style.backgroundColor = '#fff';
          buttons[1].style.backgroundColor = '#F56218';
          buttons[2].style.backgroundColor = '#fff';
        }
      });
      google.maps.event.addDomListener(buttons[2], 'click', function() {
        map.setOptions({ draggableCursor: 'url(eraser_copy.png), auto', draggable: true});
        eraser = true;
        if(lineDrawn) {
          markers = createMarkers();
          lineDrawn.setOptions({clickable: false, editable: false});
          buttons[0].style.backgroundColor = '#fff';
          buttons[1].style.backgroundColor = '#fff';
          buttons[2].style.backgroundColor = '#F56218';
        }
      });
      google.maps.event.addDomListener(buttons[3], 'click', function() {
        map.setZoom(map.getZoom() + 1);
      });
      google.maps.event.addDomListener(buttons[4], 'click', function() {
        map.setZoom(map.getZoom() - 1);
      });
      google.maps.event.addDomListener(controlDiv, 'click', function() {
        // Click on done_button
        console.log("Done clicked");
        if (lineDrawn) {
          // If a path has been drawn, put its coordinates in the global
          // variable routeCoords.
          var path = lineDrawn.getPath();
          var coords = [];
          path.forEach(function(coord) {
            coords.push({lat: coord.lat(), lon: coord.lng()}); 
          });
          routeCoords = coords;
        }
        // Call the map_done_func after we finish
        map_done_func();
        
      });
      map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(controlDiv);
      map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(zoomControlDiv);
    }
    else {      
      var images = ['zoom_in.png', 'zoom_out.png'];
      var buttons = images.map(createButton);
      buttons.forEach(function(button) { zoomControlWrapper.appendChild(button); });
      google.maps.event.addDomListener(buttons[0], 'click', function() {
        map.setZoom(map.getZoom() + 1);
      });
      google.maps.event.addDomListener(buttons[1], 'click', function() {
        map.setZoom(map.getZoom() - 1);
      });
      map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(zoomControlDiv);
    }
    if (routeCoords !== undefined && routeCoords !== null && routeCoords.length > 1) {
      console.log("putting routeCoords in map");
      var latLonCoords = routeCoords.map(function(coord) {
        return (new google.maps.LatLng(coord.lat, coord.lon));
      });
      lineDrawn = new google.maps.Polyline({
        path: latLonCoords,
        clickable: true,
        draggable: false,
        editable: false,
        geodesic: false,
        strokeColor: '#000000',
        strokeOpacity: 1,
        strokeWeight: 5
      });
      if (isCreateMode) {
        lineDrawn.setOptions({editable: true});
      }
      else {
        createMarkers();
      }
      lineDrawn.setMap(map);
      resetStartEndMarkers();
    }
  }, "jsonp");
}

//google.maps.event.addDomListener(window, 'load', initialize);

function getCoords() {
  return routeCoords;
}

function getMapImage(coords) {
  if (!coords) {
    // singlewhitepixel.gif
    return "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICRAEAOw==";
  }
  var first = '' + coords[0].lat + ',' + coords[0].lon;
  var last = '' + coords[coords.length-1].lat + ',' + coords[coords.length-1].lon;
  var prepend = 'https://maps.googleapis.com/maps/api/staticmap?center=' + first;
  prepend += '&zoom=13&size=300x300&markers=color:green%7clabel:A%7c' + first;
  prepend += '&markers=color:red%7clabel:B%7c' + last;
  prepend += '&path=color:0x000000%7cweight:5';
  coords.forEach(function(coord) {
    prepend += '%7c' + coord.lat + ',' + coord.lon;
  });
  return prepend;
}

function getRouteLength(coords) {
  var meterDistance = 0;
  var path = [];
  coords.forEach(function(coord, i) {
    var lat = coord.lat;
    var lon = coord.lon;
    var point = new google.maps.LatLng(lat, lon);
    path.push(point);
    if (i>0) meterDistance += google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i-1]);
  });
  return meterDistance * 0.000621371;
}

function getRouteCityState(coords, callback) {
  var geocoder = new google.maps.Geocoder();
  var latlon = new google.maps.LatLng(coords[0].lat, coords[0].lon);
  var city;
  var state;
  geocoder.geocode({'latLng': latlon}, function(results, status) {
    if(status == google.maps.GeocoderStatus.OK) {
      console.log(results);
      var first = results[0].address_components;
      first.forEach(function(component) {
        if (!city && component.types.indexOf('locality') > -1) city = component.short_name; 
        if (!state && component.types.indexOf('administrative_area_level_1') > -1) state = component.short_name; 
      });
      callback({city: city, state: state});
    }
    else {
      callback();
    }
  });
}
