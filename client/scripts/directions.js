var Directions = (function () {

    var _apiKey = null;

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

        var originStr = source.lat + ',' + source.lng;
        var destinationStr = destination.lat + ',' + destination.lng;
        var arrivalTimeStr = Date.parse('next monday').set({
            hour : 9
        }).getTime().toString();
        arrivalTimeStr = arrivalTimeStr.substring(0,arrivalTimeStr.length-4);


        $.get('/directions?' + 'origin=' + originStr + '&destination=' + destinationStr + '&mode=transit&arrival_time=' + arrivalTimeStr + '&key=' + _apiKey ).then(function(response) {
            if (response.status !== 'OK') {
                onError(response.message);
            }
            if (response && response.results && response.results.length) {
                success({
                    lat : response.results[0].geometry.location.lat,
                    lng : response.results[0].geometry.location.lng
                });
            }
        }, onError)
    };

    _initializeModule();
    return {
        get : getDirections
    };

})();