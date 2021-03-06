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
    google.maps.event.addListener(map, "rightclick", onRightClick);
}

var refresh = function() {
	$('#locationTable').bootstrapTable('refresh');
};

var resumePairing = function() {
    $.get('/missingpairs').then(function(response) {
        var missingPairInfo = JSON.parse(response);
        var requestQueue = [];

        Object.keys(missingPairInfo).forEach(function(name) {
            var info = missingPairInfo[name];
            var source = {
                lat : info.lat,
                lng : info.lng
            };
            info.destinations.forEach(function(destinationInfo) {
                var destination = {
                    lat : destinationInfo.lat,
                    lng : destinationInfo.lng
                };

                requestQueue.push({
                    sourceId : info.id,
                    destinationId : destinationInfo.id,
                    source : source,
                    destination : destination
                });
            });
        });

        var MS_PER_DAY = 1000 * 60 * 60 * 24;
        var REQUESTS_PER_DAY = 2450;
        var DELAY = MS_PER_DAY/REQUESTS_PER_DAY;
		var fails = 0;

        var processNext = function() {
            var request = requestQueue.shift();

            function onError(err) {
                console.log(JSON.stringify(err));
				fails++;
				if (fails >= 10) {
					clearInterval(intId);
					alert('Failed more than 10 times.   Bailing!');
				}
                requestQueue.enqueue(request);
            }


            Directions.get(request.source,request.destination,function(response) {
				$.ajax({
					url: '/rawresponses',
					type : 'POST',
					data: {
						source : request.sourceId,
						destination : request.destinationId,
						response : response
					}
				}).then(function() {
					refresh();
				},onError)
            },onError);
        };


        processNext();
        var intId = setInterval(processNext,DELAY)
    });
}

var onRightClick = function(event) {
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    // populate yor box/field with lat, lng
    $('#customLocationName').val('');
    $('#addCustomLocationModal').modal();
    $('#customLat').text(lat);
    $('#customLng').text(lng);
};

var onAddCustomLocation = function() {
    var name = $('#customLocationName').val();
    if (name) {
        name = name.trim();
        if (name !== '') {
            var lat = $('#customLat').text();
            var lng = $('#customLng').text();
            $.ajax({
                type:'post',
                url:'/customlocation',
                data:{
                    name:name,
                    lat:lat,
                    lng:lng
                }
            }).then(
                function(response) {
                    refresh();
                },
                function(err) {
                    alert(err);
                }
            );
        }
    }
};

var onDelete = function() {
    var id = $(this).attr('data-id');
    if (id) {
        id = id.trim();
        if (id !== '') {
            $.ajax({
                url : 'neighbourhoods',
                type : 'DELETE',
                data : {
                    id : id
                }
            }).then(
                function() {
                    refresh();
                },
                function(err) {
                    alert(err);
                }
            )
        }
    }
};

var onLoadSuccess = function() {
	var data = $('#locationTable').bootstrapTable('getData');
	clearMarkers();
	data.forEach(function(row) {
		addMarker(new google.maps.LatLng(row.lat,row.lng), row.name);
	});
	updateMarkers();

    var deletePlaceholders = $('#locationTable').find('.delete-btn');
    for (var i = 1; i < deletePlaceholders.length; i++) {// skip the header!
        var id = $(deletePlaceholders[i]).parent().find('.place-id').text();
        var btn = $('<button class="btn btn-default btn-small" data-id="' + id + '"><span class="glyphicon glyphicon-remove"></button>');
        $(deletePlaceholders[i]).replaceWith(btn);
        btn.click(onDelete);
    }

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

    $('#resumePairing').click(function() {
        resumePairing();
    });

    $('#onAddCustomLocationsBtn').click(function() {
        onAddCustomLocation();
    })

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
