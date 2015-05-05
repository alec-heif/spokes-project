function initialize() {
  $.get("http://ipinfo.io", function(response) {
    var controlDiv = document.createElement('div');
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '9px';
    controlUI.style.marginRight = '-15px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);

    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '18';
    controlText.style.lineHeight = '32px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Save';
    controlUI.appendChild(controlText);

    controlDiv.index = 10;
    controlDiv.style['z-index'] = 10;

    var loc = response.loc.split(',');
    var mapOptions = {
      zoom: 15,
      center: new google.maps.LatLng(loc[0], loc[1]),
      disableDefaultUI: true
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYLINE,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_LEFT,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYLINE
        ]
      },
      polylineOptions: {
        clickable: true,
        draggable: false,
        editable: true,
        geodesic: true,
        strokeColor: '#ff0000',
        strokeOpacity: 1,
        strokeWeight: 5
      } 
    });
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(controlDiv);
    drawingManager.setMap(map);
    var mapType = new google.maps.StyledMapType(); 
    map.mapTypes.set("Dummy Style", mapType); 
    map.setMapTypeId("Dummy Style");
    google.maps.event.addListener(drawingManager, 'polylinecomplete', function(polyline) {
      console.log(polyline);
    });
  }, "jsonp");
}
google.maps.event.addDomListener(window, 'load', initialize);
