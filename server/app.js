var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var config = require('./modules/config');
var db_init = require('./modules/db_init');



// Setup server
var app = express();
app.use(express.static('C:/workspace/NeighbourhoodDirections/client'));
app.use(bodyParser());
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
//
//// Setup routes
//app.get('/stations', function(req,res) {
//	stations.get(function(stations) {
//		res.end(JSON.stringify(stations));
//	});
//});
//
//app.get('/knownroutes', function(req,res) {
//	var url_parts = url.parse(req.url, true);
//	var query = url_parts.query;
//	var table = query.normalized == 'true' ? 'normalizedroutes' : 'routes';
//	console.log('Reqesting all known routes');
//	routes.getKnownRouteConnectivity(table,function(knownRoutes) {
//		console.log('Serving all known ' + table);
//		res.end(JSON.stringify(knownRoutes));
//	});
//});
//
//
//app.post('/routes', function(req,res) {
//	var body = req.body;
//	var table = body.normalized == true ? 'normalizedroutes' : 'routes';
//
//	if (body.points instanceof Object) {
//		var pointsArray = [];
//		for (var idx in body.points) {
//			if (body.points.hasOwnProperty(idx)) {
//				pointsArray.push(body.points[idx]);
//			}
//		}
//		body.points = pointsArray;
//	}
//	console.log('Adding ' + table + ' for ' + body.source + ' to ' + body.destination + ' (' + pointsArray.length + ' points)');
//	routes.postRoute(body.source, body.destination, body.points, table, function() {
//		console.log('Added ' + table + ' for ' + body.source + ' to ' + body.destination + ' (' + pointsArray.length + ' points)');
//		res.code = 201;
//		res.end();
//	});
//});
//
//app.get('/routes', function(req,res) {
//	var url_parts = url.parse(req.url, true);
//	var query = url_parts.query;
//	var table = query.normalized == true ? 'normalizedroutes' : 'routes';
//	console.log('Requesting ' + table + ' for ' + query.source + ' to ' + query.destination);
//	routes.getRoute(query.source, query.destination, table, function(points) {
//		console.log('Serving ' + table + ' for ' + query.source + ' to ' + query.destination);
//		res.end(JSON.stringify(points));
//	});
//});
