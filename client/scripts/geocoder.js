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
				if (response.status !== 'OK') {
					var ibreak = 0;
					ibreak++;
				}
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

	var geocodeList = function(places,bounds,success,error,progress) {

		var placesMap = {};

		function onComplete() {
			success(placesMap);
		}

		var total = places.length;
		var processed = 0;
		progress(0);

		var lastRequest = new Date().getTime();
		var pid = Process.each(places,function(place,processNext) {

			function throttleNext() {
				var currentTime = new Date().getTime();
				if (currentTime-lastRequest < 250) {
					setTimeout(function() {
						throttleNext();
					},250);
				} else {
					lastRequest = currentTime;
					processed++;
					progress(processed/total);
					processNext();
				}
			}


			function onGeocodeSuccess(result) {
				placesMap[place] = result;
				throttleNext();
			}

			function onGeocodeError(err) {
				Process.cancelProcess(pid);
				if (error) error(err);
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