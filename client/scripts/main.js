/**
 * Created by cdickson on 8/24/14.
 */
var directionsDisplay;
var map;

var initializeMap = function() {
	directionsDisplay = new google.maps.DirectionsRenderer();

	var styleArray = [
		{
			featureType: "all",
			stylers: [
				{ saturation: -80 }
			]
		},{
			featureType: "road.arterial",
			elementType: "geometry",
			stylers: [
				{ hue: "#00ffee" },
				{ saturation: 50 }
			]
		},{
			featureType: "poi.business",
			elementType: "labels",
			stylers: [
				{ visibility: "off" }
			]
		}
	];


	var toronto = new google.maps.LatLng(43.6753189,-79.4236684);
	var mapOptions = {
		zoom:12,
		center: toronto
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	map.setOptions({styles : styleArray});
	directionsDisplay.setMap(map);
}

var initialize = function() {
	initializeMap();

	$('#addLocations').click(function() {
		$('#addLocationsModal').modal()
	});

	$('#onAddLocationsBtn').click(function() {
		var placesStr = $('#locationsTextarea').val();
		var places = placesStr.split('\n');
		Geocoder.geocodeList(places,function(placeMap) {
			// TODO: save in db
			var ibreak = 0;
			ibreak++;
		});
	});
};


google.maps.event.addDomListener(window, 'load', initialize);