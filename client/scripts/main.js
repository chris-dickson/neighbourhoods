/**
 * Created by cdickson on 8/24/14.
 */
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var stationList = [];

var initialize = function() {
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
		zoom:8,
		center: toronto
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	map.setOptions({styles : styleArray});
	directionsDisplay.setMap(map);

	$.ajax({
		url : 'http://localhost:8080/stations',
		complete : function(response) {
			stationList = JSON.parse(response.responseText);

			for (var i = 0; i < stationList.length; i++) {
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(stationList[i].lat, stationList[i].lon),
					title: stationList[i].name
				});
				marker.setMap(map);
			}
			plotRoute(7000,7001,true);
		}
	});
};

var heatmapPoints = function(points) {
	var googlePoints = [];
	for (var i = 0; i < points.length; i++) {
		googlePoints.push(new google.maps.LatLng(points[i].lat, points[i].lon));
	}
	var googleArray = new google.maps.MVCArray(googlePoints);
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: googleArray
	});
	heatmap.setMap(map);
}

var plotRoute = function(sourceId, destinationId, normalized) {
	getRoute(sourceId,destinationId,normalized, function(sourceid, destid, points) {
		heatmapPoints(points);
	});
};


google.maps.event.addDomListener(window, 'load', initialize);