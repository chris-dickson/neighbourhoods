var Geocoder = (function () {

	var _apiKey = null;

	var _initializeModule = function() {
		$.get('/geocoderkey').then(function(key) {
			_apiKey = key;
		});
	};

	var geocode = function(place,success,error) {
		// TODO:  geocode and return!
		if (!_apiKey) {
			error('No API key has been set');
			return;
		}
		var url = 'https://maps.googleapis.com/maps/api/geocode/json?' +
			'colloquial_area=' + encodeURIComponent(place) + '&key=' + _apiKey;

		$.get(url).then(
			function(response) {
				// TODO:  parse it!
			},
			function(err) {
				if (error) error(err);
			}
		);
	};

	var geocodeList = function(places,success,error) {

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

			geocode(place,onGeocodeSuccess,onGeocodeError);
		},onComplete);

	}

	_initializeModule();
	return {
		geocode : geocode,
		geocodeList : geocodeList
	};

})();