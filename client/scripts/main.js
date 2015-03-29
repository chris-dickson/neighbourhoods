/**
 * Created by cdickson on 8/24/14.
 */
var directionsDisplay;
var map;
var markers = [];

// Add a marker to the map and push to the array.
var addMarker = function(location,title) {
	var marker = new google.maps.Marker({
		position: location,
		map: map,
		title : title
	});
	markers.push(marker);
}

// Removes the markers from the map, but keeps them in the array.
var clearMarkers = function() {
	markers = [];
}

// Sets the map on all markers in the array.
var updateMarkers = function() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

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
	refresh();
}

var refresh = function() {
	$('#locationTable').bootstrapTable('refresh');
}

var onLoadSuccess = function() {
	var data = $('#locationTable').bootstrapTable('getData');
	clearMarkers();
	data.forEach(function(row) {
		addMarker(new google.maps.LatLng(row.lat,row.lng), row.name);
	});
	updateMarkers();
}

var initialize = function() {

	initializeMap();

	$('#locationTable').on('load-success.bs.table', onLoadSuccess);
	$('#addLocations').click(function() {
		$('#addLocationsModal').modal()
	});

	$('#refreshLocations').click(function() {
		refresh();
	});

	$('#onAddLocationsBtn').click(function() {
		var placesStr = $('#locationsTextarea').val();
		var places = placesStr.split('\n');

		AjaxLoader.show();
		Geocoder.geocodeList(places,null,function(placeMap) {
			AjaxLoader.hide();
			$.ajax({
				method: 'POST',
				url: '/neighbourhoods',
				data: placeMap
			}).then(
				function() {
					refresh();
				},
				function(err) {
					alert(err);
				}
			)
		}, function(err) {
			AjaxLoader.hide();
			alert(err);
		}, function(progress) {
			AjaxLoader.progress(progress);
		});
	});
};


google.maps.event.addDomListener(window, 'load', initialize);