var connectionPool = require('./db/connection');

//------------------------------------------------------------------------------------
// gets a map from source id to a list of destination ids for which we have lat/lon
// paths computed for
//------------------------------------------------------------------------------------
var getKnownRouteConnectivity = function(tableName,callback) {
	connectionPool.open(function(connection) {
		connection.query('SELECT DISTINCT source,destination FROM ' + tableName +';', function(err, rows, fields) {
			var knownRouteConnectivity = {};
			if (rows) {
				for (var i = 0; i < rows.length; i++) {
					var row = rows[i];
					var srcList = knownRouteConnectivity[row.source];
					if (!srcList) {
						srcList = [];
					}
					srcList.push(row.destination);
					knownRouteConnectivity[row.source] = srcList;
				}
			}
			callback(knownRouteConnectivity);
		});

		connectionPool.close(connection);
	});
};

var postRoute = function(source,destination,points,tableName,callback) {
	connectionPool.open(function(connection) {

		// Create a list of queries that insert points 1000 at a time
		var queriesList = [];
		var statementCount = 0;
		var queryBase = 'INSERT INTO ' + tableName + ' (source,destination,point_index,lat,lon) VALUES';
		var query = queryBase;
		for (var i = 0; i < points.length; i++) {
			query += '(' + source + ',' + destination + ',' + i + ',' + points[i].lat + ',' + points[i].lon + '),';
			statementCount++;
			if (statementCount % 1000 === 0) {
				query = query.substring(0,queries.length-1);
				queriesList.push(query);
				query = queryBase;
			}
		}
		query = query.substring(0,query.length-1);
		queriesList.push(query);

		// Execute all queries and notify when they've all completed
		var queriesReminaing = queriesList.length;
		for (var i = 0; i < queriesList.length; i++) {
			(function(index) {
				connection.query(queriesList[index], function(err,row,fields) {
					queriesReminaing--;
					if (err) throw err;
					if (queriesReminaing === 0) {
						connectionPool.close(connection);
						callback();
					}
				})
			})(i);
		}



	});
};

var getRoute = function(source,destination,tableName,callback) {
	if (!source || !destination || !tableName) {
		callback([]);
	}

	connectionPool.open(function(connection) {
		connection.query('SELECT lat,lon from ' + tableName + ' where source=' + source + ' and destination=' + destination + ' order by point_index ASC', function(err, rows, fields) {
			if (err) throw err;
			connectionPool.close(connection);
			callback(rows ? rows : []);
		});
	});
};

module.exports.getKnownRouteConnectivity = getKnownRouteConnectivity;
module.exports.postRoute = postRoute;
module.exports.getRoute = getRoute;