var Directions = (function () {

    var _apiKey = null;
	var directionsService = new google.maps.DirectionsService();


	var _initializeModule = function() {
        $.get('/geocoderkey').then(function(key) {
            _apiKey = key.substring(1,key.length-1);
        });
    };

    var getDirections = function(source,destination,success,error) {

        function onError(err) {
            if (error) error(err);
        }


        if (!_apiKey) {
            onError('No API key has been set');
            return;
        }


        var arrivalTime = Date.parse('next monday').set({
            hour : 9
        });

		var directionsRequest = {
			origin 		: new google.maps.LatLng(source.lat,source.lng),
			destination : new google.maps.LatLng(destination.lat,destination.lng),
			travelMode  : google.maps.TravelMode.TRANSIT,
			transitOptions : {
				arrivalTime: arrivalTime
			}
		};

		directionsService.route(directionsRequest, function(result,status) {
			if (status == google.maps.DirectionsStatus.OK) {
				if (result.routes && result.routes.length) {
					var mainRoute = result.routes[0];
					var legs = mainRoute.legs;
					var simpleLegs = [];

					legs.forEach(function(leg) {
						var simpleLeg = {};
						simpleLeg.arrival_time = leg.arrival_time.text;
						simpleLeg.departure_time = leg.departure_time.text;
						simpleLeg.distance = leg.distance.value;
						simpleLeg.duration = leg.duration.value;
						simpleLeg.end_address = leg.end_address
						simpleLeg.start_address = leg.start_address;
						simpleLegs.push(simpleLeg);
					});
					success(simpleLegs);
				} else {
					onError('no routes found');
				}
			}
			else {
				onError(result);
			}
		});
    };

    _initializeModule();
    return {
        get : getDirections
    };

})();