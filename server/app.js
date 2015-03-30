var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var config = require('./modules/config');
var db_init = require('./modules/db_init');
var Neighbourhoods = require('./modules/rest/neighbourhoods');
var Geocoder = require('./modules/rest/geocoder');
var RawResponses = require('./modules/rest/rawresponses');


// Setup server
var app = express();

app.use(express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));

var server = app.listen(config.port, function() {
	console.log('Listening on port %d', server.address().port);

	console.log('Initializing database');
	db_init.initialize(function() {
		console.log('\tsuccess!');
	}, function(err) {
		console.log('\terror:');
		console.log(err);
	});
});


app.get('/neighbourhoods',function(req,res) {

    function onError(err) {
        res.status(500).end(err);
    }


	Neighbourhoods.getAll(function(rows) {


        var pairingSummary = {};
        rows.forEach(function (place) {
            pairingSummary[place.name] = 0;
        });

        RawResponses.get(function (existingPairs) {
            existingPairs.forEach(function (pair) {
                pairingSummary[pair.source] = pairingSummary[pair.source] + 1;
            });
        },onError);

        Object.keys(pairingSummary).forEach(function(name) {
            pairingSummary[name] = (pairingSummary[name] / (rows.length-1)) + '%';
        });

        rows.forEach(function(place) {
            place.percentPaired = pairingSummary[place.name];
        });

		res.end(JSON.stringify(rows))
	}, onError);
});

app.post('/neighbourhoods',function(req,res) {
	var placeMap = req.body;
	Neighbourhoods.add(placeMap, function() {
		res.send('success');
	}, function(err) {
		res.status(500).send(err);
	});
});

app.delete('/neighbourhoods',function(req,res) {
    var id = req.body.id;
    Neighbourhoods.deletePlace(id,function() {
        res.send('success');
    }, function(err) {
        res.status(500).send(err);
    });
});

app.get('/geocoderkey',function(req,res) {
	res.end(JSON.stringify(Geocoder.getKey()));
});

app.post('/customlocation',function(req,res) {
    var data = req.body;
    var name = data.name;
    var lat = data.lat;
    var lng = data.lng;
    Neighbourhoods.addPlace(name,lat,lng,function() {
        res.send('success');
    },function (err) {
        res.status(500).send(err);
    })
});

app.get('/missingpairs',function(req,res) {

    function onError(err) {
        res.status(500).end();
    }


    Neighbourhoods.getAll(function(places) {
        var existingSourceToDestination = {};
        places.forEach(function(place) {
            existingSourceToDestination[place.name] = {};
        });

        RawResponses.get(function(existingPairs) {
            existingPairs.forEach(function(pair) {
                existingSourceToDestination[pair.source][pair.destination] = true;
            });

            var toFetchSourceToDest = {};
            for (var i = 0; i < places.length; i++) {
                for (var j = 0; j < places.length; j++) {
                    if (i == j || existingSourceToDestination[places[i].name][places[j].name]) {
                        continue;
                    } else {
                        var descriptor = toFetchSourceToDest[places[i].name];
                        if (!descriptor) {
                            descriptor = {
                                name : places[i].name,
                                id : places[i].id,
                                lat : places[i].lat,
                                lng : places[i].lng,
                                destinations : []
                            };
                            toFetchSourceToDest[places[i].name] = descriptor;
                        }
                        toFetchSourceToDest[places[i].name].destinations.push({
                            name : places[j].name,
                            id : places[j].id,
                            lat : places[j].lat,
                            lng : places[j].lng
                        });
                    }
                }
            }
            res.end(JSON.stringify(toFetchSourceToDest));
        },onError)
    },onError);
});



app.post('/rawresponses',function(req,res) {
    var data = req.body;
    var source = data.source;
    var destination = data.destination;
    var responseText = data.response;
    RawResponses.add(source,destination,responseText,function() {
        res.send('success');
    }, function(err) {
        res.status(500).send(err);
    })
});