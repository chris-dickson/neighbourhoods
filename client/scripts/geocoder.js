var Geocoder = (function () {

	var _initializeModule = function() {
		// TODO: create the google geocode object here
	};

	var geocode = function(place,success,error) {
		// TODO:  geocode and return!
		success();
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