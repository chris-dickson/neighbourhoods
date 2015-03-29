var Geocoder = (function () {

	var _apiKey = null;

	var _initializeModule = function() {
		$.get('/geocoderkey').then(function(key) {
			_apiKey = key.substring(1,key.length-1);
		});
	};

	var geocode = function(place,bounds,success,error) {
		// TODO:  geocode and return!
		if (!_apiKey) {
			error('No API key has been set');
			return;
		}

		//var torontoBounds = bounds.northeast.lat + ',' + bounds.northeast.lng + '|' + bounds.southwest.lat + ',' + bounds.southwest.lng;

		var url = 'https://maps.googleapis.com/maps/api/geocode/json?' +
			'address=' + encodeURIComponent(place + ' Toronto') + '&key=' + _apiKey;

		$.get(url).then(
			function(response) {
				// TODO:  parse it!
				if (response && response.results && response.results.length) {
					success({
						lat : response.results[0].geometry.location.lat,
						lng : response.results[0].geometry.location.lng
					});
				}
			},
			function(err) {
				if (error) error(err);
			}
		);
	};

	var geocodeList = function(places,bounds,success,error) {

		var placesMap = {};

		function onComplete() {
			success(placesMap);
		}

		function onError(err) {
			if (error) error(err);
		}

		Process.each(places,function(place,processNext) {

			function onGeocodeSuccess(result) {
				placesMap[place] = result;
				processNext();
			}

			function onGeocodeError(err) {
				processNext();
			}

			geocode(place,bounds,onGeocodeSuccess,onGeocodeError);
		},onComplete);

	}

	_initializeModule();
	return {
		geocode : geocode,
		geocodeList : geocodeList
	};

})();