var connectionPool = require('../db/connection');
var UUID = require('../util/uuid');
var Process = require('../util/process_each');

var TABLE_NAME = 'neighbourhoods';

var getAll = function(success,error) {
	connectionPool.open(function(conn) {

		function onError(err) {
			connectionPool.close(conn);
			if (error) error(err);
		}

		function onSuccess(rows) {
			connectionPool.close(conn);
			success(rows);
		}

		conn.query('SELECT * FROM ' + TABLE_NAME +' ORDER BY name ASC;', function(err, rows, fields) {
			onSuccess(rows);
		});
	});
};

var add = function(placeMap,success,error) {
	connectionPool.open(function(conn) {
		function onError(err) {
			connectionPool.close(conn);
			if (error) error(err);
		}

		function onSuccess() {
			success();
		}

		// Create a list of queries that insert points 1000 at a time
		var queriesList = [];
		var statementCount = 0;
		var queryBase = 'INSERT INTO ' + TABLE_NAME + ' (id,name,lat,lng,searchString) VALUES';
		var query = queryBase;
		Object.keys(placeMap).forEach(function(place) {
			if (!place || place == '' || place == ' ') {
				return;
			}

			var id = UUID.generate();
			var name = place.trim();
			var searchString = name;
			var lat = placeMap[place].lat;
			var lng = placeMap[place].lng;


			query += '(' + conn.escape(id) + ',' + conn.escape(name) + ',' + lat + ',' + lng + ',' + conn.escape(searchString) + '),';
			statementCount++;
			if (statementCount % 1000 === 0) {
				query = query.substring(0,queries.length-1);
				queriesList.push(query);
				query = queryBase;
			}
		});


		query = query.substring(0,query.length-1);
		queriesList.push(query);

		function onComplete() {
			success();
		}

		function onError(err) {
			Process.cancel(PID);
			connectionPool.close(conn);
			if (error) error(err);
		}

		// Execute all queries and notify when they've all completed
		var PID = Process.each(queriesList,function(query,processNext) {
			conn.query(query, function(err,row,fields) {
				if (err) onError(err);
				processNext();
			});
		},onComplete);

	});
}

var addPlace = function(name,lat,lng,success,error) {
    var map = {};
    map[name] = {
        lat : lat,
        lng : lng
    };
    add(map,success,error);
};

module.exports.TABLE_NAME = TABLE_NAME;
module.exports.getAll = getAll;
module.exports.add = add;
module.exports.addPlace = addPlace;